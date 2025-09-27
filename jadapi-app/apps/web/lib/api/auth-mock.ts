import { UserSignupData, BusinessSignupData, OTPVerificationData } from '../types/auth';

// Mock delay to simulate network request
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const authAPI = {
  // Send OTP to email (mock)
  sendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    await mockDelay(800);

    // Always succeed for demo
    return {
      success: true,
      message: 'OTP sent successfully!'
    };
  },

  // Verify OTP (mock)
  verifyOTP: async (data: OTPVerificationData): Promise<{ success: boolean; message: string }> => {
    await mockDelay(500);

    // Always succeed for demo
    return {
      success: true,
      message: 'OTP verified successfully!'
    };
  },

  // Sign up individual user (mock)
  signupIndividual: async (data: UserSignupData): Promise<{ success: boolean; user: any; token?: string; message?: string }> => {
    await mockDelay(1200);

    // Simulate validation
    if (!data.name || data.name.length < 2) {
      return {
        success: false,
        user: null,
        message: 'Name must be at least 2 characters long'
      };
    }

    if (!data.address || data.address.length < 5) {
      return {
        success: false,
        user: null,
        message: 'Please provide a valid address'
      };
    }

    // Mock successful signup
    return {
      success: true,
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name,
        address: data.address,
        userType: data.userType,
        createdAt: new Date().toISOString()
      },
      token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9),
      message: 'Individual account created successfully!'
    };
  },

  // Sign up business user (mock)
  signupBusiness: async (data: BusinessSignupData): Promise<{ success: boolean; user: any; token?: string; message?: string }> => {
    await mockDelay(1200);

    // Simulate validation
    if (!data.businessName || data.businessName.length < 2) {
      return {
        success: false,
        user: null,
        message: 'Business name must be at least 2 characters long'
      };
    }

    if (!data.address || data.address.length < 5) {
      return {
        success: false,
        user: null,
        message: 'Please provide a valid business address'
      };
    }

    // Mock successful signup
    return {
      success: true,
      user: {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        businessName: data.businessName,
        address: data.address,
        userType: data.userType,
        createdAt: new Date().toISOString()
      },
      token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9),
      message: 'Business account created successfully!'
    };
  },

  // Sign in (mock)
  signin: async (email: string, otp: string): Promise<{ success: boolean; user: any; token?: string }> => {
    await mockDelay(800);

    // Always succeed for demo
    return {
      success: true,
      user: {
        id: 'mock_user_id',
        email: email,
        name: 'Demo User'
      },
      token: 'mock_jwt_token_signin'
    };
  },
};