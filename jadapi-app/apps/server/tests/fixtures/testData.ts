export const TEST_USERS = {
  individual: {
    accountType: 'individual' as const,
    email: 'canadaharsh2002@gmail.com',
    displayName: 'John Doe',
  },

  business: {
    accountType: 'business' as const,
    email: 'canadaharsh2002@gmail.com',
    displayName: 'Acme Corp',
    legalName: 'Acme Corporation Inc.',
  },

  phoneOnly: {
    accountType: 'individual' as const,
    phone: '+16045551234',
    displayName: 'Phone User',
  },

  bothEmailAndPhone: {
    accountType: 'individual' as const,
    email: 'canadaharsh2002@gmail.com',
    phone: '+16045555678',
    displayName: 'Multi Contact User',
  },
} as const;

export const INVALID_TEST_DATA = {
  users: {
    noAccountType: {
      email: 'test@example.com',
      displayName: 'Test User',
    },

    noDisplayName: {
      accountType: 'individual',
      email: 'test@example.com',
    },

    invalidEmail: {
      accountType: 'individual',
      email: 'invalid-email',
      displayName: 'Test User',
    },

    invalidPhone: {
      accountType: 'individual',
      phone: '1234567890', // Not E.164 format
      displayName: 'Test User',
    },

    businessNoLegalName: {
      accountType: 'business',
      email: 'business@example.com',
      displayName: 'Business Name',
      // Missing legalName
    },

    noContactMethod: {
      accountType: 'individual',
      displayName: 'No Contact User',
      // Missing both email and phone
    },
  },

  otp: {
    noEmail: {
      code: '123456',
      type: 'signup',
    },

    noCode: {
      email: 'test@example.com',
      type: 'signup',
    },

    invalidEmail: {
      email: 'invalid-email',
      code: '123456',
      type: 'signup',
    },

    invalidCode: {
      email: 'test@example.com',
      code: '12345', // Too short
      type: 'signup',
    },

    invalidType: {
      email: 'test@example.com',
      code: '123456',
      type: 'invalid',
    },
  },
} as const;

export const VALID_ADDRESSES = {
  vancouver: {
    line1: '123 Main Street',
    line2: 'Suite 100',
    city: 'Vancouver',
    pincode: 'V6B 1A1',
    province: 'BC',
    country: 'CA',
    lat: 49.2827,
    lng: -123.1207,
  },

  burnaby: {
    line1: '456 Central Park Way',
    city: 'Burnaby',
    pincode: 'V5H 2P1',
    province: 'BC',
    country: 'CA',
    lat: 49.2488,
    lng: -122.9805,
  },

  richmond: {
    line1: '789 Number 3 Road',
    city: 'Richmond',
    pincode: 'V6X 2B8',
    province: 'BC',
    country: 'CA',
    lat: 49.1913,
    lng: -123.1363,
  },
} as const;

export const OTP_CODES = {
  valid: '123456',
  expired: '654321',
  used: '111111',
  maxAttempts: '999999',
} as const;

export const API_RESPONSES = {
  emailAlreadyRegistered: {
    status: 409,
    message: 'Email already registered',
  },

  phoneAlreadyRegistered: {
    status: 409,
    message: 'Phone number already registered',
  },

  invalidOtp: {
    status: 400,
    message: 'Invalid or expired OTP code',
  },

  otpSentSuccess: {
    status: 200,
    message: 'OTP sent successfully',
  },

  otpVerifiedSuccess: {
    status: 200,
    message: 'OTP verified successfully',
  },

  emailVerificationRequired: {
    status: 400,
    message: 'Email must be verified with OTP before signup',
  },
} as const;