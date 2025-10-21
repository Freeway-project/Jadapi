import { apiClient } from './client';

export interface AppStatusResponse {
  success: boolean;
  data: {
    appActive: boolean;
    maintenanceMessage?: string;
  };
  message?: string;
}

export interface EarlyAccessRequest {
  pickupAddress: string;
  dropoffAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  estimatedFare?: {
    distance?: number;
    total?: number;
    currency: string;
  };
  notes?: string;
}

export interface EarlyAccessResponse {
  success: boolean;
  data: {
    requestId: string;
  };
  message: string;
}

export const appConfigAPI = {
  checkAppStatus: async (): Promise<AppStatusResponse | null> => {
    try {
      const response = await apiClient.get('/status');
      return response.data;
    } catch (error) {
      console.error('Failed to check app status:', error);
      return null;
    }
  },

  submitEarlyAccessRequest: async (data: EarlyAccessRequest): Promise<EarlyAccessResponse> => {
    const response = await apiClient.post('/app-config/early-access', data);
    return response.data;
  },
};
