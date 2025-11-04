import {
  FareEstimateInput,
  FareEstimateResult,
  FareBreakdown,
  PricingConfig,
  PackageSize
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
   * Calculate fare breakdown with new BC pricing structure
   * Formula:
   * 1. X = $0.88 per minute * duration
   * 2. Distance surcharge (based on X):
   *    - 0-5 km: 0%
   *    - 5-10 km: 5% of X
   *    - 10+ km: 8% of X
   * 3. Fees (calculated on X only):
   *    - BC Courier Fee: 2% of X
   *    - BC Carbon Green Fee: 0.9% of X
   *    - Service Fee: 1% of X
   * 4. Subtotal = X + distanceSurcharge + all fees
   * 5. GST = 5% of subtotal
   * 6. Total = subtotal + GST
   */
  private static calculateFareBreakdown(
    distanceKm: number,
    durationMinutes: number,
    packageSize: PackageSize,
    config: PricingConfig
  ): FareBreakdown {
    const { rateCard, ui } = config;

    // Step 1: X = $0.88 per minute (88 cents per minute)
    const perMinuteCents = rateCard.per_min_cents || 88; // 88 cents = $0.88
    const baseFareCents = Math.round(durationMinutes * perMinuteCents);

    // Step 2: Calculate distance surcharge based on distance
    let distanceSurchargeRate = 0;
    if (distanceKm <= 5) {
      distanceSurchargeRate = 0;        // 0% for 0-5km
    } else if (distanceKm <= 10) {
      distanceSurchargeRate = 0.05;     // 5% for 5-10km
    } else {
      distanceSurchargeRate = 0.08;     // 8% for 10km+
    }
    const distanceSurchargeCents = Math.round(baseFareCents * distanceSurchargeRate);

    // Step 3: Calculate fees (all based on X, not X + surcharge)
    const bcCourierFeeCents = Math.round(baseFareCents * 0.02);    // 2% of X
    const bcCarbonFeeCents = Math.round(baseFareCents * 0.009);   // 0.9% of X
    const serviceFeeCents = Math.round(baseFareCents * 0.01);     // 1% of X

    // Step 4: Calculate subtotal
    const subtotalCents = baseFareCents + distanceSurchargeCents +
                          bcCourierFeeCents + bcCarbonFeeCents + serviceFeeCents;

    // Step 5: Calculate GST (5% of subtotal)
    const gstCents = Math.round(subtotalCents * 0.05);

    // Step 6: Calculate total
    const totalCents = subtotalCents + gstCents;

    return {
      baseFare: this.formatCents(baseFareCents, ui.round_display_to_cents),
      distanceSurcharge: this.formatCents(distanceSurchargeCents, ui.round_display_to_cents),
      fees: {
        bcCourierFee: this.formatCents(bcCourierFeeCents, ui.round_display_to_cents),
        bcCarbonFee: this.formatCents(bcCarbonFeeCents, ui.round_display_to_cents),
        serviceFee: this.formatCents(serviceFeeCents, ui.round_display_to_cents),
        gst: this.formatCents(gstCents, ui.round_display_to_cents)
      },
      tax: this.formatCents(gstCents, ui.round_display_to_cents), // For backward compatibility
      total: this.formatCents(totalCents, ui.round_display_to_cents),
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
