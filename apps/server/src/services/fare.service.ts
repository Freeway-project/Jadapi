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
   * Calculate detailed fare breakdown
   */
  private static calculateFareBreakdown(
    distanceKm: number,
    durationMinutes: number,
    packageSize: PackageSize,
    config: PricingConfig
  ): FareBreakdown {
    const { rateCard, bands, tax, ui } = config;

    // Base fare
    const baseFare = rateCard.base_cents;

    // Distance-based fare
    const distanceFare = Math.round(distanceKm * rateCard.per_km_cents);

  // Time-based fare removed — set to 0 (duration still returned for info)
  const timeFare = 0;

    // Get distance band multiplier
    const band = this.getDistanceBand(distanceKm, bands);

    // Package size multiplier
    const sizeMultiplier = rateCard.size_multiplier[packageSize] || 1.0;

  // Calculate subtotal before multipliers (exclude time-based charge)
  const baseSubtotal = baseFare + distanceFare; // timeFare intentionally omitted

    // // Apply band multiplier
    // const afterBandMultiplier = Math.round(baseSubtotal * band.multiplier);

    // // Apply size multiplier
    // const afterSizeMultiplier = Math.round(afterBandMultiplier * sizeMultiplier);

    // Apply minimum fare
    // const finalSubtotal = Math.max(afterSizeMultiplier, rateCard.min_fare_cents);
    const finalSubtotal = rateCard.min_fare_cents;

    // Calculate tax
    const taxAmount = tax.enabled ? Math.round(finalSubtotal * tax.rate) : 0;

    // Total
    const total = finalSubtotal + taxAmount;

    return {
      baseFare: this.formatCents(baseFare, ui.round_display_to_cents),
      distanceFare: this.formatCents(distanceFare, ui.round_display_to_cents),
      timeFare: this.formatCents(timeFare, ui.round_display_to_cents),
      bandMultiplier: band.multiplier,
      bandLabel: ui.show_band_label ? band.label : '',
      sizeMultiplier,
      edgeSurcharge: 0,
      subtotal: this.formatCents(finalSubtotal, ui.round_display_to_cents),
      tax: this.formatCents(taxAmount, ui.round_display_to_cents),
      total: this.formatCents(total, ui.round_display_to_cents),
      currency: rateCard.currency,
      distanceKm: Math.round(distanceKm * 100) / 100,
      durationMinutes: Math.round(durationMinutes)
    };
  }

  /**
   * Get the appropriate distance band for the given distance
   */
  private static getDistanceBand(distanceKm: number, bands: DistanceBand[]): DistanceBand {
    for (const band of bands) {
      if (distanceKm <= band.km_max) {
        return band;
      }
    }
    // Return last band if distance exceeds all bands
    return bands[bands.length - 1];
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
