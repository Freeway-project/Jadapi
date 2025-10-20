import { apiClient } from './client';

export interface PaymentConfig {
  publishableKey: string;
}

export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentIntentId: string;
  };
  message?: string;
}

export const paymentAPI = {
  getConfig: async (): Promise<PaymentConfig> => {
    const response = await apiClient.get('/payment/config');
    return response.data?.data || response.data;
  },

  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
    const response = await apiClient.post('/payment/create-intent', data);
    return response.data;
  },
};
