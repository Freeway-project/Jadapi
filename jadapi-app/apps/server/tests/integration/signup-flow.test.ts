import app from '../../src/app';
import { TestHelpers } from '../helpers/testHelpers';
import { Otp } from '../../src/models/Otp';
import { User } from '../../src/models/user.model';

// Set up test helpers
TestHelpers.setApp(app);

describe('Complete Signup Flow Integration Tests', () => {
  const testEmail = 'canadaharsh2002@gmail.com';

  describe('Email-based Signup Flow', () => {
    it('should complete full signup flow: OTP request -> verify -> signup', async () => {
      // Step 1: Request OTP
      const otpResponse = await TestHelpers.getRequest()
        .post('/api/auth/otp/request')
        .send({
          email: testEmail,
          type: 'signup'
        });

      TestHelpers.expectOtpResponse(otpResponse);
      expect(otpResponse.body.email).toBe(testEmail);

      // Get the generated OTP from database
      const otpRecord = await Otp.findOne({
        email: testEmail,
        type: 'signup',
        verified: false
      });
      expect(otpRecord).toBeTruthy();
      const otpCode = otpRecord!.code;

      // Step 2: Verify OTP
      const verifyResponse = await TestHelpers.getRequest()
        .post('/api/auth/otp/verify')
        .send({
          email: testEmail,
          code: otpCode,
          type: 'signup'
        });

      TestHelpers.expectSuccess(verifyResponse);
      expect(verifyResponse.body).toMatchObject({
        message: 'OTP verified successfully',
        email: testEmail,
        verified: true,
      });

      // Step 3: Complete Signup
      const signupResponse = await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'individual',
          email: testEmail,
          displayName: 'Test User Full Flow'
        });

      TestHelpers.expectUserResponse(signupResponse, 201);
      expect(signupResponse.body).toMatchObject({
        accountType: 'individual',
        roles: ['customer'],
        profile: {
          displayName: 'Test User Full Flow',
        },
        auth: {
          email: testEmail,
          emailVerifiedAt: expect.any(String), // Should be verified after OTP
        },
      });

      // Step 4: Verify user in database
      const user = await User.findOne({ 'auth.email': testEmail });
      expect(user).toBeTruthy();
      expect(user?.auth.emailVerifiedAt).toBeTruthy();
      expect(user?.uuid).toBeTruthy();
      expect(user?.status).toBe('active');
    });

    it('should complete business signup flow with legal name', async () => {
      const businessEmail = 'business+' + Date.now() + '@example.com';

      // Step 1: Request OTP
      await TestHelpers.getRequest()
        .post('/api/auth/otp/request')
        .send({ email: businessEmail, type: 'signup' });

      // Get OTP code
      const otpRecord = await Otp.findOne({
        email: businessEmail,
        type: 'signup',
        verified: false
      });
      const otpCode = otpRecord!.code;

      // Step 2: Verify OTP
      await TestHelpers.getRequest()
        .post('/api/auth/otp/verify')
        .send({ email: businessEmail, code: otpCode, type: 'signup' });

      // Step 3: Business Signup
      const signupResponse = await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'business',
          email: businessEmail,
          displayName: 'Test Business',
          legalName: 'Test Business Inc.'
        });

      TestHelpers.expectUserResponse(signupResponse, 201);
      expect(signupResponse.body).toMatchObject({
        accountType: 'business',
        roles: ['business'],
        profile: {
          displayName: 'Test Business',
          legalName: 'Test Business Inc.',
        },
      });
    });
  });

  describe('Phone-only Signup Flow', () => {
    it('should allow signup with phone number only (no OTP required)', async () => {
      const testPhone = '+16045559999';

      const signupResponse = await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'individual',
          phone: testPhone,
          displayName: 'Phone Only User'
        });

      TestHelpers.expectUserResponse(signupResponse, 201);
      expect(signupResponse.body).toMatchObject({
        accountType: 'individual',
        profile: {
          displayName: 'Phone Only User',
        },
        auth: {
          phone: testPhone,
        },
      });
      expect(signupResponse.body.auth.email).toBeUndefined();

      // Verify in database
      const user = await User.findOne({ 'auth.phone': testPhone });
      expect(user).toBeTruthy();
      expect(user?.auth.email).toBeUndefined();
    });
  });

  describe('Error Scenarios in Complete Flow', () => {
    it('should prevent signup without OTP verification', async () => {
      const unauthorizedEmail = 'unauthorized@example.com';

      const signupResponse = await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'individual',
          email: unauthorizedEmail,
          displayName: 'Unauthorized User'
        });

      TestHelpers.expectValidationError(signupResponse);
      expect(signupResponse.body.error).toContain('Email must be verified with OTP before signup');
    });

    it('should prevent using expired OTP verification', async () => {
      const expiredEmail = 'expired+' + Date.now() + '@example.com';

      // Create expired verified OTP
      await TestHelpers.createTestOtp({
        email: expiredEmail,
        type: 'signup',
        verified: true,
        createdAt: new Date(Date.now() - 31 * 60 * 1000), // 31 minutes ago
      });

      const signupResponse = await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'individual',
          email: expiredEmail,
          displayName: 'Expired OTP User'
        });

      TestHelpers.expectValidationError(signupResponse);
      expect(signupResponse.body.error).toContain('Email must be verified with OTP before signup');
    });

    it('should prevent duplicate signup with same email', async () => {
      const duplicateEmail = 'duplicate+' + Date.now() + '@example.com';

      // Complete first signup
      await TestHelpers.createVerifiedOtp(duplicateEmail, 'signup');
      await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'individual',
          email: duplicateEmail,
          displayName: 'First User'
        });

      // Attempt second signup with same email
      await TestHelpers.createVerifiedOtp(duplicateEmail, 'signup');
      const duplicateResponse = await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'individual',
          email: duplicateEmail,
          displayName: 'Second User'
        });

      TestHelpers.expectConflict(duplicateResponse);
      expect(duplicateResponse.body.error).toBe('Email already registered');
    });

    it('should limit OTP verification attempts', async () => {
      const limitTestEmail = 'limit+' + Date.now() + '@example.com';

      // Request OTP
      await TestHelpers.getRequest()
        .post('/api/auth/otp/request')
        .send({ email: limitTestEmail, type: 'signup' });

      // Attempt verification 5 times with wrong code
      for (let i = 0; i < 5; i++) {
        await TestHelpers.getRequest()
          .post('/api/auth/otp/verify')
          .send({
            email: limitTestEmail,
            code: '000000', // Wrong code
            type: 'signup'
          });
      }

      // 6th attempt should be blocked
      const finalResponse = await TestHelpers.getRequest()
        .post('/api/auth/otp/verify')
        .send({
          email: limitTestEmail,
          code: '000000',
          type: 'signup'
        });

      expect(finalResponse.status).toBe(429);
      expect(finalResponse.body.error).toBe('Too many failed attempts. Please request a new OTP');
    });
  });

  describe('API Health and Status', () => {
    it('should return health check status', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/health');

      TestHelpers.expectSuccess(response);
      expect(response.body).toEqual({ ok: true });
    });

    it('should check OTP verification status', async () => {
      const statusEmail = 'status+' + Date.now() + '@example.com';

      // Before verification
      const beforeResponse = await TestHelpers.getRequest()
        .get('/api/auth/otp/status')
        .query({ email: statusEmail, type: 'signup' });

      TestHelpers.expectSuccess(beforeResponse);
      expect(beforeResponse.body.verified).toBe(false);

      // After verification
      await TestHelpers.createVerifiedOtp(statusEmail, 'signup');

      const afterResponse = await TestHelpers.getRequest()
        .get('/api/auth/otp/status')
        .query({ email: statusEmail, type: 'signup' });

      TestHelpers.expectSuccess(afterResponse);
      expect(afterResponse.body.verified).toBe(true);
    });
  });

  describe('User Management After Signup', () => {
    let createdUser: any;

    beforeEach(async () => {
      const uniqueEmail = 'management+' + Date.now() + '@example.com';

      // Complete signup flow
      await TestHelpers.createVerifiedOtp(uniqueEmail, 'signup');
      const signupResponse = await TestHelpers.getRequest()
        .post('/api/auth/signup')
        .send({
          accountType: 'individual',
          email: uniqueEmail,
          displayName: 'Management Test User'
        });

      createdUser = signupResponse.body;
    });

    it('should retrieve user by UUID after signup', async () => {
      const response = await TestHelpers.getRequest()
        .get(`/api/users/uuid/${createdUser.uuid}`);

      TestHelpers.expectSuccess(response);
      expect(response.body.uuid).toBe(createdUser.uuid);
      expect(response.body.profile.displayName).toBe('Management Test User');
    });

    it('should list users including newly created one', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/users')
        .query({ limit: 50 });

      TestHelpers.expectSuccess(response);
      expect(Array.isArray(response.body)).toBe(true);

      const foundUser = response.body.find((user: any) => user.uuid === createdUser.uuid);
      expect(foundUser).toBeTruthy();
    });
  });
});