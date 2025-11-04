export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
  method: 'google';
}

export interface ServiceCenter {
  code: string;
  label: string;
  lat: number;
  lng: number;
  soft_radius_km: number;
  active: boolean;
}

export interface ServiceArea {
  centers: ServiceCenter[];
}

export interface RateCard {
  currency: string;
  base_cents: number;
  per_km_cents: number;
  per_min_cents: number;
  min_fare_cents: number;
  size_multiplier: {
    XS: number;
    S: number;
    M: number;
    L: number;
  };
}

export interface DistanceBand {
  km_max: number;
  multiplier: number;
  label: string;
}

export interface TaxConfig {
  enabled: boolean;
  rate: number;
}

export interface UIConfig {
  show_band_label: boolean;
  round_display_to_cents: boolean;
}

export interface PricingConfig {
  serviceArea: ServiceArea;
  rateCard: RateCard;
  bands: DistanceBand[];
  tax: TaxConfig;
  ui: UIConfig;
}

export type PackageSize = 'XS' | 'S' | 'M' | 'L';

export interface FareEstimateInput {
  pickup: Coordinates;
  dropoff: Coordinates;
  packageSize?: PackageSize;
  duration?: number;
}

export interface FeeBreakdown {
  bcCourierFee: number;      // BC Courier Fee (2% of baseFare)
  bcCarbonFee: number;       // BC Carbon Green Fee (0.9% of baseFare)
  serviceFee: number;        // Service Fee (1% of baseFare)
  gst: number;               // GST (5%)
}

export interface FareBreakdown {
  baseFare: number;          // Base fare (X = $0.88 * duration_minutes)
  distanceSurcharge: number; // Distance-based surcharge (0%, 5%, or 8% of baseFare)
  fees: FeeBreakdown;        // All taxes and fees breakdown
  tax: number;               // Total tax (for backward compatibility)
  total: number;             // Final total
  currency: string;          // Currency code (e.g., 'CAD')
  distanceKm: number;        // Distance in kilometers
  durationMinutes: number;   // Duration in minutes
}

export interface FareEstimateResult {
  fare: FareBreakdown;
  distance: DistanceResult;
  isOutsideServiceArea: boolean;
  nearestCenter?: ServiceCenter;
  serviceAreas?: {
    pickup?: string;
    dropoff?: string;
  };
}
