import { UserSignupData, BusinessSignupData } from '../types/auth';
import { apiClient, tokenManager } from './client';

// Re-export tokenManager for external use
export { tokenManager };

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
  name: string;  // User's name (required)
  address: string;  // Address (required)
  businessName?: string;  // Business name for business accounts
  gstNumber?: string;  // GST number for business accounts (optional)
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


  // Login with email and password (returns JWT token)
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;

    // Store token in localStorage
    tokenManager.setToken(token);

    return { token, user };
  },

  // Logout
  logout: () => {
    tokenManager.removeToken();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!tokenManager.getToken();
  },
};