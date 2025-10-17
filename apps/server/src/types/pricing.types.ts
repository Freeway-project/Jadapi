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

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  bandMultiplier: number;
  bandLabel: string;
  sizeMultiplier: number;
  edgeSurcharge: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  distanceKm: number;
  durationMinutes: number;
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
