export type UserType = 'individual' | 'business';

export interface AuthState {
  step: 'userType' | 'email' | 'verification';
  userType: UserType | null;
  email: string;
  isLoading: boolean;
  error: string | null;
}

export interface UserSignupData {
  email: string;
  name: string;
  address: string;
  userType: UserType;
}

export interface BusinessSignupData {
  email: string;
  businessName: string;
  address: string;
  userType: UserType;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
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