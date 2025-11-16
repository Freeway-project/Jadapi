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

export interface FeeBreakdown {
  bcCourierFee: number;    // BC Courier Fee (2% of baseFare) (in cents)
  bcCarbonFee: number;     // BC Carbon Green Fee (0.9% of baseFare) (in cents)
  serviceFee: number;      // Service Fee (1% of baseFare) (in cents)
  gst: number;             // GST (5%) (in cents)
}

export interface FareBreakdown {
  baseFare: number;          // Base fare (X = $0.88 * duration_minutes) (in cents)
  distanceSurcharge: number; // Distance-based surcharge (0%, 5%, or 8% of baseFare) (in cents)
  fees: FeeBreakdown;        // All taxes and fees breakdown
  tax: number;               // Total tax (for backward compatibility) (in cents)
  total: number;             // Final total (in cents)
  currency: string;          // Currency code (e.g., 'CAD')
  distanceKm: number;        // Distance in kilometers
  durationMinutes: number;   // Duration in minutes
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

export interface PhotoUploadResponse {
  success: boolean;
  data: {
    photoUrl: string;
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

  uploadPickupPhoto: async (orderId: string, photoBase64: string): Promise<PhotoUploadResponse> => {
    const response = await apiClient.put(`/delivery/${orderId}/upload-pickup-photo`, {
      photo: photoBase64
    });
    return response.data;
  },

  uploadDropoffPhoto: async (orderId: string, photoBase64: string): Promise<PhotoUploadResponse> => {
    const response = await apiClient.put(`/delivery/${orderId}/upload-dropoff-photo`, {
      photo: photoBase64
    });
    return response.data;
  },
};
