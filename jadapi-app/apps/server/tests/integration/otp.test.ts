import app from '../../src/app';
import { TestHelpers, TEST_EMAILS } from '../helpers/testHelpers';
import { INVALID_TEST_DATA, OTP_CODES, API_RESPONSES } from '../fixtures/testData';
import { Otp } from '../../src/models/Otp';
import { User } from '../../src/models/user.model';

// Set up test helpers
TestHelpers.setApp(app);

describe('OTP Endpoints', () => {
  describe('POST /api/auth/otp/request', () => {
    describe('Success Cases', () => {
      it('should send OTP for valid email (signup)', async () => {
        const response = await TestHelpers.requestOtp(TEST_EMAILS.valid, 'signup');

        TestHelpers.expectOtpResponse(response);
        expect(response.body.email).toBe(TEST_EMAILS.valid);

        // Verify OTP was created in database
        const otp = await Otp.findOne({ email: TEST_EMAILS.valid, type: 'signup' });
        expect(otp).toBeTruthy();
        expect(otp?.code).toMatch(/^\d{6}$/); // 6 digit code
        expect(otp?.verified).toBe(false);
      });

      it('should send OTP for login type', async () => {
        const response = await TestHelpers.requestOtp(TEST_EMAILS.valid, 'login');

        TestHelpers.expectOtpResponse(response);
        expect(response.body.email).toBe(TEST_EMAILS.valid);

        const otp = await Otp.findOne({ email: TEST_EMAILS.valid, type: 'login' });
        expect(otp).toBeTruthy();
      });

      it('should send OTP for password reset', async () => {
        const response = await TestHelpers.requestOtp(TEST_EMAILS.valid, 'password_reset');

        TestHelpers.expectOtpResponse(response);
        expect(response.body.email).toBe(TEST_EMAILS.valid);

        const otp = await Otp.findOne({ email: TEST_EMAILS.valid, type: 'password_reset' });
        expect(otp).toBeTruthy();
      });

      it('should invalidate previous OTP when requesting new one', async () => {
        // Request first OTP
        await TestHelpers.requestOtp(TEST_EMAILS.valid, 'signup');
        const firstOtp = await Otp.findOne({ email: TEST_EMAILS.valid, type: 'signup' });

        // Request second OTP
        await TestHelpers.requestOtp(TEST_EMAILS.valid, 'signup');

        // First OTP should be marked as verified (invalidated)
        const invalidatedOtp = await Otp.findById(firstOtp?._id);
        expect(invalidatedOtp?.verified).toBe(true);

        // New OTP should exist and be unverified
        const newOtp = await Otp.findOne({
          email: TEST_EMAILS.valid,
          type: 'signup',
          verified: false
        });
        expect(newOtp).toBeTruthy();
        expect(newOtp?._id).not.toEqual(firstOtp?._id);
      });
    });

    describe('Validation Errors', () => {
      it('should reject request without email', async () => {
        const response = await TestHelpers.getRequest()
          .post('/api/auth/otp/request')
          .send(INVALID_TEST_DATA.otp.noEmail);

        TestHelpers.expectValidationError(response, 'email');
      });

      it('should reject request with invalid email format', async () => {
        const response = await TestHelpers.getRequest()
          .post('/api/auth/otp/request')
          .send(INVALID_TEST_DATA.otp.invalidEmail);

        TestHelpers.expectValidationError(response, 'email');
      });

      it('should reject request with invalid type', async () => {
        const response = await TestHelpers.getRequest()
          .post('/api/auth/otp/request')
          .send(INVALID_TEST_DATA.otp.invalidType);

        TestHelpers.expectValidationError(response, 'type');
      });

      it('should reject signup OTP for existing user', async () => {
        // Create existing user
        await TestHelpers.createTestUser({
          auth: { email: TEST_EMAILS.existing }
        });

        const response = await TestHelpers.requestOtp(TEST_EMAILS.existing, 'signup');

        TestHelpers.expectConflict(response);
        expect(response.body.error).toBe(API_RESPONSES.emailAlreadyRegistered.message);
      });
    });
  });

  describe('POST /api/auth/otp/verify', () => {
    beforeEach(async () => {
      // Create a test OTP for verification
      await TestHelpers.createTestOtp({
        email: TEST_EMAILS.valid,
        code: OTP_CODES.valid,
        type: 'signup',
        verified: false,
        attempts: 0,
      });
    });

    describe('Success Cases', () => {
      it('should verify correct OTP code', async () => {
        const response = await TestHelpers.verifyOtp(
          TEST_EMAILS.valid,
          OTP_CODES.valid,
          'signup'
        );

        TestHelpers.expectSuccess(response);
        expect(response.body).toMatchObject({
          message: 'OTP verified successfully',
          email: TEST_EMAILS.valid,
          verified: true,
        });
        expect(response.body).toHaveProperty('otpId');

        // Verify OTP is marked as verified in database
        const otp = await Otp.findOne({ email: TEST_EMAILS.valid, code: OTP_CODES.valid });
        expect(otp?.verified).toBe(true);
      });

      it('should increment attempts for wrong code', async () => {
        const response = await TestHelpers.verifyOtp(
          TEST_EMAILS.valid,
          'wrongcode',
          'signup'
        );

        TestHelpers.expectValidationError(response);

        // Verify attempt count increased
        const otp = await Otp.findOne({ email: TEST_EMAILS.valid, code: OTP_CODES.valid });
        expect(otp?.attempts).toBe(1);
        expect(otp?.verified).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it('should reject verification without email', async () => {
        const response = await TestHelpers.getRequest()
          .post('/api/auth/otp/verify')
          .send(INVALID_TEST_DATA.otp.noEmail);

        TestHelpers.expectValidationError(response, 'email');
      });

      it('should reject verification without code', async () => {
        const response = await TestHelpers.getRequest()
          .post('/api/auth/otp/verify')
          .send(INVALID_TEST_DATA.otp.noCode);

        TestHelpers.expectValidationError(response, 'code');
      });

      it('should reject invalid email format', async () => {
        const response = await TestHelpers.getRequest()
          .post('/api/auth/otp/verify')
          .send(INVALID_TEST_DATA.otp.invalidEmail);

        TestHelpers.expectValidationError(response, 'email');
      });

      it('should reject invalid code format', async () => {
        const response = await TestHelpers.getRequest()
          .post('/api/auth/otp/verify')
          .send(INVALID_TEST_DATA.otp.invalidCode);

        TestHelpers.expectValidationError(response, 'code');
      });

      it('should reject non-existent OTP', async () => {
        const response = await TestHelpers.verifyOtp(
          'nonexistent@example.com',
          '123456',
          'signup'
        );

        TestHelpers.expectValidationError(response);
        expect(response.body.error).toBe(API_RESPONSES.invalidOtp.message);
      });

      it('should reject expired OTP', async () => {
        // Create expired OTP
        await TestHelpers.createTestOtp({
          email: 'expired@example.com',
          code: OTP_CODES.expired,
          type: 'signup',
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        });

        const response = await TestHelpers.verifyOtp(
          'expired@example.com',
          OTP_CODES.expired,
          'signup'
        );

        TestHelpers.expectValidationError(response);
        expect(response.body.error).toBe(API_RESPONSES.invalidOtp.message);
      });

      it('should reject OTP after max attempts', async () => {
        // Create OTP with max attempts
        await TestHelpers.createTestOtp({
          email: 'maxattempts@example.com',
          code: OTP_CODES.maxAttempts,
          type: 'signup',
          attempts: 5,
        });

        const response = await TestHelpers.verifyOtp(
          'maxattempts@example.com',
          OTP_CODES.maxAttempts,
          'signup'
        );

        TestHelpers.expectValidationError(response);
        expect(response.body.error).toBe('Too many failed attempts. Please request a new OTP');
      });
    });
  });

  describe('GET /api/auth/otp/status', () => {
    it('should return verification status for verified email', async () => {
      await TestHelpers.createVerifiedOtp(TEST_EMAILS.verified, 'signup');

      const response = await TestHelpers.getRequest()
        .get('/api/auth/otp/status')
        .query({
          email: TEST_EMAILS.verified,
          type: 'signup'
        });

      TestHelpers.expectSuccess(response);
      expect(response.body).toMatchObject({
        email: TEST_EMAILS.verified,
        verified: true,
        type: 'signup',
      });
    });

    it('should return false for non-verified email', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/auth/otp/status')
        .query({
          email: 'unverified@example.com',
          type: 'signup'
        });

      TestHelpers.expectSuccess(response);
      expect(response.body).toMatchObject({
        email: 'unverified@example.com',
        verified: false,
        type: 'signup',
      });
    });

    it('should require email parameter', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/auth/otp/status')
        .query({ type: 'signup' });

      TestHelpers.expectValidationError(response, 'email');
    });
  });
});