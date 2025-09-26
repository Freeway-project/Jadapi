import request from 'supertest';
import { Express } from 'express';
import { User, UserDoc } from '../../src/models/user.model';
import { Otp, OtpDoc } from '../../src/models/Otp';
import { Address, AddressDoc } from '../../src/models/Address';

export class TestHelpers {
  static app: Express;

  static setApp(app: Express) {
    this.app = app;
  }

  static getRequest() {
    if (!this.app) {
      throw new Error('App not set. Call TestHelpers.setApp(app) first.');
    }
    return request(this.app);
  }

  // User creation helpers
  static async createTestUser(userData: Partial<UserDoc> = {}): Promise<UserDoc> {
    const defaultUser = {
      accountType: 'individual' as const,
      roles: ['customer' as const],
      auth: {
        email: 'test@example.com',
        phone: '+16045551234',
      },
      profile: {
        displayName: 'Test User',
      },
      addressBook: [],
    };

    const user = new User({ ...defaultUser, ...userData });
    return await user.save();
  }

  static async createBusinessUser(userData: Partial<UserDoc> = {}): Promise<UserDoc> {
    const businessUser = {
      accountType: 'business' as const,
      roles: ['business' as const],
      auth: {
        email: 'business@example.com',
      },
      profile: {
        displayName: 'Test Business',
        legalName: 'Test Business Inc.',
      },
      addressBook: [],
    };

    const user = new User({ ...businessUser, ...userData });
    return await user.save();
  }

  // OTP helpers
  static async createTestOtp(otpData: Partial<OtpDoc> = {}): Promise<OtpDoc> {
    const defaultOtp = {
      email: 'test@example.com',
      code: '123456',
      type: 'signup' as const,
      verified: false,
      attempts: 0,
    };

    const otp = new Otp({ ...defaultOtp, ...otpData });
    return await otp.save();
  }

  static async createVerifiedOtp(email: string, type: 'signup' | 'login' | 'password_reset' = 'signup'): Promise<OtpDoc> {
    return this.createTestOtp({
      email,
      type,
      verified: true,
      createdAt: new Date(), // Recent verification
    });
  }

  // Address helpers
  static async createTestAddress(userId: string, addressData: Partial<AddressDoc> = {}): Promise<AddressDoc> {
    const defaultAddress = {
      ownerUserId: userId,
      line1: '123 Test Street',
      city: 'Vancouver',
      pincode: 'V6B 1A1',
      province: 'BC' as const,
      country: 'CA' as const,
      lat: 49.2827,
      lng: -123.1207,
      isDefault: false,
    };

    const address = new Address({ ...defaultAddress, ...addressData });
    return await address.save();
  }

  // API testing helpers
  static async requestOtp(email: string, type: 'signup' | 'login' | 'password_reset' = 'signup') {
    return this.getRequest()
      .post('/auth/otp/request')
      .send({ email, type });
  }

  static async verifyOtp(email: string, code: string, type: 'signup' | 'login' | 'password_reset' = 'signup') {
    return this.getRequest()
      .post('/auth/otp/verify')
      .send({ email, code, type });
  }

  static async signupUser(userData: {
    accountType: 'individual' | 'business';
    email?: string;
    phone?: string;
    displayName: string;
    legalName?: string;
  }) {
    return this.getRequest()
      .post('/auth/signup')
      .send(userData);
  }

  // Test data generators
  static generateEmail(prefix: string = 'test'): string {
    return `${prefix}+${Date.now()}@example.com`;
  }

  static generatePhone(): string {
    const area = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `+1${area}${exchange}${number}`;
  }

  static generate6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Database cleanup helpers
  static async clearAllUsers(): Promise<void> {
    await User.deleteMany({});
  }

  static async clearAllOtps(): Promise<void> {
    await Otp.deleteMany({});
  }

  static async clearAllAddresses(): Promise<void> {
    await Address.deleteMany({});
  }

  static async clearAll(): Promise<void> {
    await Promise.all([
      this.clearAllUsers(),
      this.clearAllOtps(),
      this.clearAllAddresses(),
    ]);
  }

  // Assertion helpers
  static expectValidationError(response: any, field?: string) {
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    if (field) {
      expect(response.body.error.toLowerCase()).toContain(field.toLowerCase());
    }
  }

  static expectNotFound(response: any) {
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  }

  static expectConflict(response: any) {
    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
  }

  static expectSuccess(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toBeDefined();
  }

  static expectOtpResponse(response: any) {
    this.expectSuccess(response, 200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('expiresAt');
  }

  static expectUserResponse(response: any, expectedStatus: number = 201) {
    this.expectSuccess(response, expectedStatus);
    expect(response.body).toHaveProperty('uuid');
    expect(response.body).toHaveProperty('accountType');
    expect(response.body).toHaveProperty('roles');
    expect(response.body).toHaveProperty('profile');
    expect(response.body).toHaveProperty('auth');
    expect(response.body).not.toHaveProperty('_id'); // Should not expose internal ID
  }
}

// Export commonly used test emails
export const TEST_EMAILS = {
  valid: 'test@example.com',
  business: 'business@example.com',
  individual: 'individual@example.com',
  verified: 'verified@example.com',
  existing: 'existing@example.com',
} as const;