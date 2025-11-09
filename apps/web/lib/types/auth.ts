export type UserType = 'individual' | 'business';

export interface AuthState {
  step: 'userType' | 'email' | 'individualSignup' | 'businessSignup' | 'success' | 'signin' | 'signinOtp' | 'verification';
  userType: UserType | null;
  authMode: 'signup' | 'signin';
  email: string;
  phoneNumber: string;
  isLoading: boolean;
  error: string | null;
  user?: any;
}

export interface UserSignupData {
  email?: string;
  phoneNumber: string;
  name: string;
  address: string;
  userType: UserType;
}

export interface BusinessSignupData {
  email: string;
  phoneNumber: string;
  businessName: string;
  address: string;
  userType: UserType;
}

export interface OTPVerificationData {
  email?: string;
  phoneNumber?: string;
  otp: string;
  deliveryMethod: 'email' | 'sms';
}

export interface SigninData {
  identifier: string; // can be email or phone
  identifierType: 'email' | 'phone';
}

export interface AddressPlace {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GeocodedAddress {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}