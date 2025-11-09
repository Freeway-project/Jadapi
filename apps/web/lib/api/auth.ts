import { apiClient, tokenManager } from './client';

// Re-export tokenManager for external use
export { tokenManager };

export interface EmailOTPRequestData {
  email: string;
  type?: 'signup' | 'login' | 'password_reset';
}

export interface PhoneOTPRequestData {
  phoneNumber: string;
  type?: 'signup' | 'login' | 'password_reset';
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
  // Request OTP for email
  requestEmailOTP: async (data: EmailOTPRequestData) => {
    console.log('🚀 [authAPI.requestEmailOTP] Payload being sent:', JSON.stringify(data, null, 2));
    const response = await apiClient.post('/auth/otp/request-email', data);
    console.log('✅ [authAPI.requestEmailOTP] Response received:', response.data);
    return response.data;
  },

  // Request OTP for phone
  requestPhoneOTP: async (data: PhoneOTPRequestData) => {
    console.log('🚀 [authAPI.requestPhoneOTP] Payload being sent:', JSON.stringify(data, null, 2));
    const response = await apiClient.post('/auth/otp/request-phone', data);
    console.log('✅ [authAPI.requestPhoneOTP] Response received:', response.data);
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
    console.log('🚀 [authAPI.signup] Payload being sent:', JSON.stringify(data, null, 2));
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

    // Backend returns { message, token, user } directly in response.data
    const token = response.data?.token;
    const user = response.data?.user;

    if (!token || !user) {
      throw new Error('Invalid response from server');
    }

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