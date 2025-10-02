import { Coordinates, DistanceResult } from '../types/pricing.types';
import { ENV } from '../config/env';
import axios from 'axios';

/**
 * Distance calculation service using Google Maps Distance Matrix API
 */
export class DistanceService {

  private static readonly GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  /**
   * Calculate distance and estimated time using Google Maps Distance Matrix API
   */
  static async calculate(
    pickup: Coordinates,
    dropoff: Coordinates
  ): Promise<DistanceResult> {
    if (!ENV.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const params = {
      origins: `${pickup.lat},${pickup.lng}`,
      destinations: `${dropoff.lat},${dropoff.lng}`,
      mode: 'driving',
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
    const durationMinutes = Math.ceil(element.duration.value / 60);

    return {
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMinutes,
      method: 'google'
    };
  }

  /**
   * Check if a point is within radius of any center
   * Uses simple straight-line distance for service area validation
   */
  static isWithinServiceArea(
    point: Coordinates,
    centers: Array<{ lat: number; lng: number; soft_radius_km: number }>
  ): { isWithin: boolean; nearestDistance: number; nearestIndex: number } {
    let minDistance = Infinity;
    let nearestIndex = -1;

    centers.forEach((center, index) => {
      // Simple straight-line distance in km
      const latDiff = point.lat - center.lat;
      const lngDiff = point.lng - center.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // ~111km per degree

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
   * Validate coordinates
   */
  static validateCoordinates(coords: Coordinates): boolean {
    return (
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lng >= -180 &&
      coords.lng <= 180
    );
  }
}
