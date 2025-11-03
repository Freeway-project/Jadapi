import {
  FareEstimateInput,
  FareEstimateResult,
  FareBreakdown,
  PricingConfig,
  PackageSize,
  DistanceBand,
  ServiceCenter
} from '../types/pricing.types';
import { DistanceService } from './distance.service';
import { ConfigService } from './config.service';
import { logger } from '../utils/logger';

/**
 * Fare estimation service with configurable pricing
 * Supports distance-based, time-based, and size-based pricing
 */
export class FareService {

  /**
   * Calculate fare estimate based on pickup/dropoff coordinates
   */
  static async estimateFare(input: FareEstimateInput): Promise<FareEstimateResult> {
    // Validate coordinates
    if (!input.pickup || !input.dropoff) {
      throw new Error('Pickup and dropoff coordinates are required');
    }

    // Validate coordinate format
    if (!DistanceService.validateCoordinates(input.pickup)) {
      throw new Error('Invalid pickup coordinates');
    }
    if (!DistanceService.validateCoordinates(input.dropoff)) {
      throw new Error('Invalid dropoff coordinates');
    }

    // Validate service area
    const areaValidation = await DistanceService.validateServiceArea(
      input.pickup,
      input.dropoff
    );
    
    if (!areaValidation.isValid) {
      throw new Error(areaValidation.error || 'Location outside service area');
    }

    // Get current pricing configuration
    const config = await ConfigService.getActiveConfig();
    logger.debug({ config }, 'FareService.estimateFare - config loaded');

    // Calculate distance and time
    const distance = await DistanceService.calculate(input.pickup, input.dropoff);
    logger.debug({ distance }, 'FareService.estimateFare - distance calculated');


    // Calculate fare breakdown
    const fare = this.calculateFareBreakdown(
      distance.distanceKm,
      input.duration || distance.durationMinutes,
      input.packageSize || 'S',
      config.payload
    );

    return {
      fare,
      distance,
      isOutsideServiceArea: false,
      nearestCenter: undefined,
      serviceAreas: {
        pickup: areaValidation.pickupArea,
        dropoff: areaValidation.dropoffArea
      }
    };
  }

  /**
   * Calculate simplified fare breakdown
   * Formula: baseFare = base + (distance * per_km with configurable tier multipliers)
   * Distance tiers are defined in config.bands (configurable):
   * Default setup:
   * - 0-5 km: base per_km rate × 1.0 (e.g., $0.99/km)
   * - 5-10 km: base per_km rate × 1.1 (e.g., $1.09/km)
   * - above 10 km: base per_km rate × 1.2 (e.g., $1.19/km)
   * Apply package size multiplier and minimum fare
   * Then add tax to get total
   * Note: Time/duration does NOT affect pricing
   */
  private static calculateFareBreakdown(
    distanceKm: number,
    durationMinutes: number,
    packageSize: PackageSize,
    config: PricingConfig
  ): FareBreakdown {
    const { rateCard, tax, ui } = config;

    // Base component
    const baseComponent = rateCard.base_cents;

    // Distance-based calculation with tiered multipliers from config bands
    let distanceComponent = 0;
    const basePerKm = rateCard.per_km_cents; // 99 cents = $0.99 per km
    const { bands } = config;

    // Sort bands by km_max to ensure correct order
    const sortedBands = [...bands].sort((a, b) => a.km_max - b.km_max);

    let previousKm = 0;
    let remainingDistance = distanceKm;

    for (let i = 0; i < sortedBands.length; i++) {
      const band = sortedBands[i];
      const bandDistance = band.km_max - previousKm;

      if (remainingDistance > 0) {
        const distanceInBand = Math.min(remainingDistance, bandDistance);
        distanceComponent += distanceInBand * basePerKm * band.multiplier;
        remainingDistance -= distanceInBand;
        previousKm = band.km_max;
      } else {
        break;
      }
    }

    distanceComponent = Math.round(distanceComponent);

    // Sum all components (no duration component)
    let calculatedFare = baseComponent + distanceComponent;

    // Apply package size multiplier
    const sizeMultiplier = rateCard.size_multiplier[packageSize] || 1.0;
    calculatedFare = Math.round(calculatedFare * sizeMultiplier);

    // Apply minimum fare
    const baseFare = Math.max(calculatedFare, rateCard.min_fare_cents);

    // Calculate tax (GST/HST)
    const taxAmount = tax.enabled ? Math.round(baseFare * tax.rate) : 0;

    // Total
    const total = baseFare + taxAmount;

    return {
      baseFare: this.formatCents(baseFare, ui.round_display_to_cents),
      tax: this.formatCents(taxAmount, ui.round_display_to_cents),
      total: this.formatCents(total, ui.round_display_to_cents),
      currency: rateCard.currency,
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMinutes: Math.round(durationMinutes)
    };
  }

  /**
   * Format cents to display format
   */
  private static formatCents(cents: number, roundToCents: boolean): number {
    if (roundToCents) {
      return Math.round(cents);
    }
    return Math.round(cents * 100) / 100;
  }

  /**
   * Get fare estimate as display string
   */
  static formatFareDisplay(fare: FareBreakdown): string {
    const dollars = (fare.total / 100).toFixed(2);
    return `${fare.currency} $${dollars}`;
  }

  /**
   * Get fare range for a given distance (min to max based on size)
   */
  static async estimateFareRange(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number }
  ): Promise<{ min: string; max: string; currency: string }> {
    const config = await ConfigService.getActiveConfig();

    // Calculate for smallest and largest package sizes
    const minEstimate = await this.estimateFare({
      pickup,
      dropoff,
      packageSize: 'XS'
    });

    const maxEstimate = await this.estimateFare({
      pickup,
      dropoff,
      packageSize: 'L'
    });

    return {
      min: this.formatFareDisplay(minEstimate.fare),
      max: this.formatFareDisplay(maxEstimate.fare),
      currency: config.payload.rateCard.currency
    };
  }

  /**
   * Validate fare configuration
   */
  static validateConfig(config: PricingConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate rate card
    if (config.rateCard.base_cents < 0) {
      errors.push('Base fare cannot be negative');
    }
    if (config.rateCard.per_km_cents < 0) {
      errors.push('Per km rate cannot be negative');
    }
    if (config.rateCard.per_min_cents < 0) {
      errors.push('Per minute rate cannot be negative');
    }
    if (config.rateCard.min_fare_cents < 0) {
      errors.push('Minimum fare cannot be negative');
    }

    // Validate bands
    if (!config.bands || config.bands.length === 0) {
      errors.push('At least one distance band is required');
    } else {
      const sorted = [...config.bands].sort((a, b) => a.km_max - b.km_max);
      if (JSON.stringify(sorted) !== JSON.stringify(config.bands)) {
        errors.push('Distance bands must be sorted by km_max');
      }
    }

    // Validate size multipliers
    const sizes: PackageSize[] = ['XS', 'S', 'M', 'L'];
    for (const size of sizes) {
      if (!config.rateCard.size_multiplier[size] || config.rateCard.size_multiplier[size] < 0) {
        errors.push(`Invalid size multiplier for ${size}`);
      }
    }

    // Validate service area
    if (!config.serviceArea.centers || config.serviceArea.centers.length === 0) {
      errors.push('At least one service center is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
