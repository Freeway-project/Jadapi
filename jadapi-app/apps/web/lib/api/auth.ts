import axios, { AxiosResponse, AxiosError } from 'axios';
import { UserSignupData, BusinessSignupData } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 10 seconds timeout
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    const errorMessage = error.response?.data?.error ||
                        error.response?.data?.message ||
                        error.message ||
                        'Unknown error';

    throw new AuthAPIError(errorMessage, error.response?.status);
  }
);

class AuthAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthAPIError';
  }
}

export interface OTPRequestData {
  email?: string;
  phoneNumber?: string;
  type?: 'signup' | 'login' | 'password_reset';
  deliveryMethod?: 'email' | 'sms' | 'both';
  userType?: 'individual' | 'business';
}

export interface OTPVerifyData {
  identifier: string; // email or phone
  code: string;
  type?: 'signup' | 'login' | 'password_reset';
}

export interface SignupData {
  accountType: 'individual' | 'business';
  email?: string;
  phone?: string;
  displayName: string;
  legalName?: string; // required for business
  address?: string; // required for business
}

export const authAPI = {
  // Request OTP (supports both email and phone)
  requestOTP: async (data: OTPRequestData) => {
    const response = await apiClient.post('/auth/otp/request', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: OTPVerifyData) => {
    const response = await apiClient.post('/auth/otp/verify', data);
    return response.data;
  },

  // Check OTP verification status
  checkOTPStatus: async (identifier: string, type: string = 'signup') => {
    const response = await apiClient.get('/auth/otp/status', {
      params: { identifier, type }
    });
    return response.data;
  },

  // Unified signup endpoint
  signup: async (data: SignupData) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  // Get user by UUID
  getUserByUuid: async (uuid: string) => {
    const response = await apiClient.get(`/users/uuid/${uuid}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Legacy methods for backward compatibility (deprecated)
  // @deprecated Use requestOTP instead
  sendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    const result = await authAPI.requestOTP({ email, type: 'signup', deliveryMethod: 'email' });
    return { success: true, message: result.message };
  },

  // @deprecated Use signup instead
  signupIndividual: async (data: UserSignupData): Promise<{ success: boolean; user: any; token?: string }> => {
    const signupData: SignupData = {
      accountType: 'individual',
      phone: data.phoneNumber,
      email: data.email,
      displayName: data.name,
    };
    const result = await authAPI.signup(signupData);
    return { success: true, user: result, token: undefined };
  },

  // @deprecated Use signup instead
  signupBusiness: async (data: BusinessSignupData): Promise<{ success: boolean; user: any; token?: string }> => {
    const signupData: SignupData = {
      accountType: 'business',
      email: data.email,
      phone: data.phoneNumber,
      displayName: data.businessName,
      legalName: data.businessName, // Use business name as legal name for now
    };
    const result = await authAPI.signup(signupData);
    return { success: true, user: result, token: undefined };
  },

  // @deprecated Use requestOTP + verifyOTP instead
  signin: async (email: string, otp: string): Promise<{ success: boolean; user: any; token?: string }> => {
    const verifyResult = await authAPI.verifyOTP({ identifier: email, code: otp, type: 'login' });
    return { success: true, user: verifyResult, token: undefined };
  },
};