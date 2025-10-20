import { apiClient } from './client';

export interface ValidateCouponRequest {
  code: string;
  orderAmount: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  data?: {
    coupon: {
      id: string;
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
    };
    discount: number;
    newTotal: number;
  };
  message?: string;
}

export const couponAPI = {
  validateCoupon: async (data: ValidateCouponRequest): Promise<ValidateCouponResponse> => {
    try {
      const response = await apiClient.post('/coupon/validate', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to validate coupon',
      };
    }
  },
};
