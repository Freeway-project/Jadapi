import { apiClient } from './client';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FareEstimateRequest {
  pickup: Coordinates;
  dropoff: Coordinates;
  packageSize?: 'XS' | 'S' | 'M' | 'L';
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

export interface FareEstimateResponse {
  success: boolean;
  data: {
    fare: FareBreakdown;
    distance: {
      distanceKm: number;
      durationMinutes: number;
      method: string;
    };
    serviceAreas: {
      pickup?: string;
      dropoff?: string;
    };
  };
}

export interface CreateOrderRequest {
  pickup: {
    address: string;
    coordinates: Coordinates;
    contactName: string;
    contactPhone: string;
    scheduledAt?: string;
  };
  dropoff: {
    address: string;
    coordinates: Coordinates;
    contactName: string;
    contactPhone: string;
    scheduledAt?: string;
  };
  package: {
    size: 'XS' | 'S' | 'M' | 'L';
    weight?: string;
    description?: string;
  };
  pricing: FareBreakdown;
  distance: {
    distanceKm: number;
    durationMinutes: number;
  };
  coupon?: {
    couponId: string;
    code: string;
    discount: number;
  };
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order: any;
  };
  message: string;
}

export const deliveryAPI = {
  getFareEstimate: async (data: FareEstimateRequest): Promise<FareEstimateResponse> => {
    const response = await apiClient.post('/pricing/estimate', data);
    return response.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post('/delivery/create-order', data);
    return response.data;
  },
};
