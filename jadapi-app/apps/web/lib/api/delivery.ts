import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    const errorMessage = error.response?.data?.error ||
                        error.response?.data?.message ||
                        error.message ||
                        'Unknown error';

    throw new DeliveryAPIError(errorMessage, error.response?.status);
  }
);

class DeliveryAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'DeliveryAPIError';
  }
}

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

export const deliveryAPI = {
  getFareEstimate: async (data: FareEstimateRequest): Promise<FareEstimateResponse> => {
    const response = await apiClient.post('/pricing/estimate', data);
    return response.data;
  },
};
