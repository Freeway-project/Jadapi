import { UserSignupData, BusinessSignupData, OTPVerificationData } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class AuthAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AuthAPIError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new AuthAPIError(
      errorData.message || `HTTP ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export const authAPI = {
  // Send OTP to email
  sendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify OTP
  verifyOTP: async (data: OTPVerificationData): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Sign up individual user
  signupIndividual: async (data: UserSignupData): Promise<{ success: boolean; user: any; token?: string }> => {
    return apiRequest('/api/auth/signup/individual', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Sign up business user
  signupBusiness: async (data: BusinessSignupData): Promise<{ success: boolean; user: any; token?: string }> => {
    return apiRequest('/api/auth/signup/business', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Sign in
  signin: async (email: string, otp: string): Promise<{ success: boolean; user: any; token?: string }> => {
    return apiRequest('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },
};