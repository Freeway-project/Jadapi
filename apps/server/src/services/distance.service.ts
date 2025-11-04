import { Coordinates, DistanceResult } from '../types/pricing.types';
import { ENV } from '../config/env';
import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Distance calculation service using Google Maps Distance Matrix API
 *
 * TRAFFIC-AWARE DURATION CALCULATION:
 * - Uses 'departure_time: now' to get traffic-aware estimates
 * - Google Maps considers:
 *   1. Current real-time traffic conditions (live traffic data from users)
 *   2. Historical traffic patterns for the current day/time
 *   3. Road closures, construction, accidents
 *   4. Speed limits and road types
 *
 * DURATION TYPES:
 * - duration: Baseline time without traffic (speed limits only)
 * - duration_in_traffic: Traffic-aware time (what we use for pricing)
 *
 * IMPORTANT: Since we charge by TIME ($0.88/min), using traffic-aware
 * duration ensures fair pricing that reflects actual delivery time.
 */
export class DistanceService {

  private static readonly GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  /**
   * Calculate distance and estimated time using Google Maps Distance Matrix API
   * Uses traffic-aware duration for accurate pricing based on current/typical traffic conditions
   */
  static async calculate(
    pickup: Coordinates,
    dropoff: Coordinates
  ): Promise<DistanceResult> {
    if (!ENV.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    // Use current time for traffic-aware duration
    // This gives real-time or typical traffic conditions
    const params = {
      origins: `${pickup.lat},${pickup.lng}`,
      destinations: `${dropoff.lat},${dropoff.lng}`,
      mode: 'driving',
      departure_time: 'now', // Enable traffic-aware duration
      key: ENV.GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(this.GOOGLE_MAPS_API_URL, { params });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const element = response.data.rows[0]?.elements[0];

    if (!element || element.status !== 'OK') {
      throw new Error('No route found between locations');
    }

    // Google returns distance in meters and duration in seconds
    const distanceKm = element.distance.value / 1000;

    // Prefer duration_in_traffic (traffic-aware) over baseline duration
    // duration_in_traffic is available when departure_time is set
    // Falls back to baseline duration if traffic data unavailable
    const durationSeconds = element.duration_in_traffic?.value || element.duration.value;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    logger.debug({
      distanceKm,
      baselineDuration: Math.ceil(element.duration.value / 60),
      trafficDuration: element.duration_in_traffic?.value ? Math.ceil(element.duration_in_traffic.value / 60) : null,
      usedDuration: durationMinutes
    }, 'Distance calculation with traffic');

    return {
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMinutes,
      method: 'google'
    };
  }

  /**
   * Validate service area using radius-based coverage
   * Both pickup and dropoff must be within radius of any service center
   * Cross-area deliveries are allowed (e.g., Burnaby to Surrey)
   */
  static async validateServiceArea(
    pickup: Coordinates,
    dropoff: Coordinates
  ): Promise<{
    isValid: boolean;
    pickupArea?: string;
    dropoffArea?: string;
    error?: string;
  }> {
    try {
      const config = await (await import('./config.service')).ConfigService.getActiveConfig();
      const centers = config.payload.serviceArea.centers.filter(c => c.active);

      const pickupCheck = this.isWithinServiceArea(pickup, centers);
      const dropoffCheck = this.isWithinServiceArea(dropoff, centers);

      // Check if pickup is within any service area
      if (!pickupCheck.isWithin) {
        return {
          isValid: false,
          error: `Pickup location is outside our service area. We serve Surrey, Langley, and Burnaby within 20km radius.`
        };
      }

      // Check if dropoff is within any service area
      if (!dropoffCheck.isWithin) {
        return {
          isValid: false,
          error: `Dropoff location is outside our service area. We serve Surrey, Langley, and Burnaby within 20km radius.`
        };
      }

      // Both locations are valid - cross-area deliveries allowed
      return {
        isValid: true,
        pickupArea: pickupCheck.nearestIndex >= 0 ? centers[pickupCheck.nearestIndex].label : undefined,
        dropoffArea: dropoffCheck.nearestIndex >= 0 ? centers[dropoffCheck.nearestIndex].label : undefined
      };

    } catch (error) {
      logger.error({ error }, 'Service area validation error');
      return {
        isValid: false,
        error: 'Unable to validate service area. Please try again.'
      };
    }
  }

  /**
   * Check if a point is within radius of any service center
   */
  static isWithinServiceArea(
    point: Coordinates,
    centers: Array<{ lat: number; lng: number; soft_radius_km: number }>
  ): { isWithin: boolean; nearestDistance: number; nearestIndex: number } {
    let minDistance = Infinity;
    let nearestIndex = -1;

    centers.forEach((center, index) => {
      const distance = this.calculateHaversineDistance(
        point,
        { lat: center.lat, lng: center.lng }
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex === -1) {
      return { isWithin: false, nearestDistance: 0, nearestIndex: -1 };
    }

    const isWithin = minDistance <= centers[nearestIndex].soft_radius_km;

    return {
      isWithin,
      nearestDistance: minDistance,
      nearestIndex: nearestIndex
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateHaversineDistance(
    point1: Coordinates,
    point2: Coordinates
  ): number {
    const EARTH_RADIUS_KM = 6371;
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }

  /**
   * Validate coordinates format
   */
  static validateCoordinates(coords: Coordinates): boolean {
    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      return false;
    }

    return (
      coords.lat >= -90 && coords.lat <= 90 &&
      coords.lng >= -180 && coords.lng <= 180
    );
  }
}
