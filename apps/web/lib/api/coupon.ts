import { apiClient } from './client';

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
  baseFare?: number;
  accountType?: 'individual' | 'business';
}

export interface ValidateCouponResponse {
  success: boolean;
  data?: {
    valid: boolean;
    coupon: {
      code: string;
      discountType: 'eliminate_fee' | 'fixed_discount' | 'percentage_discount';
      discountValue?: number;
      description?: string;
    };
    discount: number;
    discountedSubtotal: number;
    gst: number;
    pst: number;
    totalTax: number;
    newTotal: number;
  };
  message?: string;
}

export const couponAPI = {
  validateCoupon: async (data: ValidateCouponRequest): Promise<ValidateCouponResponse> => {
    try {
      const response = await apiClient.post('/coupons/validate', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to validate coupon',
      };
    }
  },
};
