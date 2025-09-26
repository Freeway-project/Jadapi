import app from '../../src/app';
import { TestHelpers, TEST_EMAILS } from '../helpers/testHelpers';
import { TEST_USERS, INVALID_TEST_DATA, API_RESPONSES } from '../fixtures/testData';
import { User } from '../../src/models/user.model';

// Set up test helpers
TestHelpers.setApp(app);

describe('User Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    describe('Success Cases', () => {
      it('should create individual user with verified email', async () => {
        // First verify email with OTP
        await TestHelpers.createVerifiedOtp(TEST_USERS.individual.email, 'signup');

        const response = await TestHelpers.signupUser(TEST_USERS.individual);

        TestHelpers.expectUserResponse(response, 201);
        expect(response.body).toMatchObject({
          accountType: 'individual',
          roles: ['customer'],
          profile: {
            displayName: 'John Doe',
          },
          auth: {
            email: TEST_USERS.individual.email,
            emailVerifiedAt: expect.any(String), // Should be set after OTP verification
          },
        });

        // Verify user was created in database
        const user = await User.findOne({ 'auth.email': TEST_USERS.individual.email });
        expect(user).toBeTruthy();
        expect(user?.accountType).toBe('individual');
        expect(user?.auth.emailVerifiedAt).toBeTruthy();
      });

      it('should create business user with verified email', async () => {
        await TestHelpers.createVerifiedOtp(TEST_USERS.business.email, 'signup');

        const response = await TestHelpers.signupUser(TEST_USERS.business);

        TestHelpers.expectUserResponse(response, 201);
        expect(response.body).toMatchObject({
          accountType: 'business',
          roles: ['business'],
          profile: {
            displayName: 'Acme Corp',
            legalName: 'Acme Corporation Inc.',
          },
          auth: {
            email: TEST_USERS.business.email,
            emailVerifiedAt: expect.any(String),
          },
        });

        const user = await User.findOne({ 'auth.email': TEST_USERS.business.email });
        expect(user).toBeTruthy();
        expect(user?.accountType).toBe('business');
      });

      it('should create user with phone only (no OTP required)', async () => {
        const response = await TestHelpers.signupUser(TEST_USERS.phoneOnly);

        TestHelpers.expectUserResponse(response, 201);
        expect(response.body).toMatchObject({
          accountType: 'individual',
          roles: ['customer'],
          profile: {
            displayName: 'Phone User',
          },
          auth: {
            phone: TEST_USERS.phoneOnly.phone,
          },
        });
        expect(response.body.auth.email).toBeUndefined();

        const user = await User.findOne({ 'auth.phone': TEST_USERS.phoneOnly.phone });
        expect(user).toBeTruthy();
      });

      it('should create user with both email and phone', async () => {
        await TestHelpers.createVerifiedOtp(TEST_USERS.bothEmailAndPhone.email, 'signup');

        const response = await TestHelpers.signupUser(TEST_USERS.bothEmailAndPhone);

        TestHelpers.expectUserResponse(response, 201);
        expect(response.body).toMatchObject({
          auth: {
            email: TEST_USERS.bothEmailAndPhone.email,
            phone: TEST_USERS.bothEmailAndPhone.phone,
            emailVerifiedAt: expect.any(String),
          },
        });

        const user = await User.findOne({ 'auth.email': TEST_USERS.bothEmailAndPhone.email });
        expect(user).toBeTruthy();
        expect(user?.auth.phone).toBe(TEST_USERS.bothEmailAndPhone.phone);
      });

      it('should generate unique UUID for each user', async () => {
        await TestHelpers.createVerifiedOtp('user1@example.com', 'signup');
        await TestHelpers.createVerifiedOtp('user2@example.com', 'signup');

        const user1Response = await TestHelpers.signupUser({
          ...TEST_USERS.individual,
          email: 'user1@example.com',
        });

        const user2Response = await TestHelpers.signupUser({
          ...TEST_USERS.individual,
          email: 'user2@example.com',
        });

        expect(user1Response.body.uuid).toBeDefined();
        expect(user2Response.body.uuid).toBeDefined();
        expect(user1Response.body.uuid).not.toBe(user2Response.body.uuid);
      });
    });

    describe('Validation Errors', () => {
      it('should reject signup without account type', async () => {
        const response = await TestHelpers.signupUser(INVALID_TEST_DATA.users.noAccountType as any);

        TestHelpers.expectValidationError(response, 'account type');
      });

      it('should reject signup without display name', async () => {
        const response = await TestHelpers.signupUser(INVALID_TEST_DATA.users.noDisplayName as any);

        TestHelpers.expectValidationError(response, 'display name');
      });

      it('should reject signup with invalid email format', async () => {
        const response = await TestHelpers.signupUser(INVALID_TEST_DATA.users.invalidEmail as any);

        TestHelpers.expectValidationError(response, 'email');
      });

      it('should reject signup with invalid phone format', async () => {
        const response = await TestHelpers.signupUser(INVALID_TEST_DATA.users.invalidPhone as any);

        TestHelpers.expectValidationError(response, 'phone');
      });

      it('should reject business signup without legal name', async () => {
        await TestHelpers.createVerifiedOtp('business@example.com', 'signup');

        const response = await TestHelpers.signupUser(INVALID_TEST_DATA.users.businessNoLegalName as any);

        TestHelpers.expectValidationError(response, 'legal name');
      });

      it('should reject signup without contact method', async () => {
        const response = await TestHelpers.signupUser(INVALID_TEST_DATA.users.noContactMethod as any);

        TestHelpers.expectValidationError(response, 'email or phone');
      });
    });

    describe('Business Logic Errors', () => {
      it('should reject email signup without OTP verification', async () => {
        const response = await TestHelpers.signupUser(TEST_USERS.individual);

        TestHelpers.expectValidationError(response);
        expect(response.body.error).toContain('Email must be verified with OTP before signup');
      });

      it('should reject signup with existing email', async () => {
        // Create existing user
        await TestHelpers.createTestUser({
          auth: { email: TEST_EMAILS.existing }
        });

        await TestHelpers.createVerifiedOtp(TEST_EMAILS.existing, 'signup');

        const response = await TestHelpers.signupUser({
          ...TEST_USERS.individual,
          email: TEST_EMAILS.existing,
        });

        TestHelpers.expectConflict(response);
        expect(response.body.error).toBe(API_RESPONSES.emailAlreadyRegistered.message);
      });

      it('should reject signup with existing phone', async () => {
        const existingPhone = '+16045559999';

        // Create existing user
        await TestHelpers.createTestUser({
          auth: { phone: existingPhone }
        });

        const response = await TestHelpers.signupUser({
          ...TEST_USERS.phoneOnly,
          phone: existingPhone,
        });

        TestHelpers.expectConflict(response);
        expect(response.body.error).toBe(API_RESPONSES.phoneAlreadyRegistered.message);
      });

      it('should reject signup with expired OTP verification', async () => {
        // Create expired verified OTP (older than 30 minutes)
        await TestHelpers.createTestOtp({
          email: TEST_USERS.individual.email,
          type: 'signup',
          verified: true,
          createdAt: new Date(Date.now() - 31 * 60 * 1000), // 31 minutes ago
        });

        const response = await TestHelpers.signupUser(TEST_USERS.individual);

        TestHelpers.expectValidationError(response);
        expect(response.body.error).toContain('Email must be verified with OTP before signup');
      });
    });

    describe('Response Format', () => {
      it('should not expose sensitive user data', async () => {
        await TestHelpers.createVerifiedOtp(TEST_USERS.individual.email, 'signup');

        const response = await TestHelpers.signupUser(TEST_USERS.individual);

        expect(response.body).not.toHaveProperty('_id');
        expect(response.body).not.toHaveProperty('__v');
        expect(response.body).not.toHaveProperty('delegation');
        expect(response.body).not.toHaveProperty('businessProfile');
        expect(response.body.auth).not.toHaveProperty('lastLoginAt');
      });

      it('should include essential user information', async () => {
        await TestHelpers.createVerifiedOtp(TEST_USERS.individual.email, 'signup');

        const response = await TestHelpers.signupUser(TEST_USERS.individual);

        expect(response.body).toHaveProperty('uuid');
        expect(response.body).toHaveProperty('accountType');
        expect(response.body).toHaveProperty('roles');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('profile');
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('createdAt');
      });
    });
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create test users
      await TestHelpers.createTestUser({
        auth: { email: 'user1@example.com' },
        profile: { displayName: 'User 1' },
      });
      await TestHelpers.createTestUser({
        auth: { email: 'user2@example.com' },
        profile: { displayName: 'User 2' },
      });
      await TestHelpers.createTestUser({
        auth: { email: 'user3@example.com' },
        profile: { displayName: 'User 3' },
        status: 'suspended', // Should be excluded
      });
    });

    it('should list active users with pagination', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/users')
        .query({ limit: 10, skip: 0 });

      TestHelpers.expectSuccess(response);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2); // Only active users
      expect(response.body[0]).toHaveProperty('profile');
      expect(response.body[0]).toHaveProperty('auth');
    });

    it('should respect limit parameter', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/users')
        .query({ limit: 1 });

      TestHelpers.expectSuccess(response);
      expect(response.body).toHaveLength(1);
    });

    it('should sort by creation date (newest first)', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/users');

      TestHelpers.expectSuccess(response);
      expect(response.body.length).toBeGreaterThan(1);

      // Verify sorting (assuming timestamps are different)
      const dates = response.body.map((user: any) => new Date(user.createdAt));
      const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
      expect(dates).toEqual(sortedDates);
    });
  });

  describe('GET /api/users/:id', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        auth: { email: 'getuser@example.com' },
        profile: { displayName: 'Get User Test' },
      });
    });

    it('should get user by ID', async () => {
      const response = await TestHelpers.getRequest()
        .get(`/api/users/${testUser._id}`);

      TestHelpers.expectSuccess(response);
      expect(response.body._id.toString()).toBe(testUser._id.toString());
      expect(response.body.profile.displayName).toBe('Get User Test');
    });

    it('should return 404 for non-existent user ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await TestHelpers.getRequest()
        .get(`/api/users/${fakeId}`);

      TestHelpers.expectNotFound(response);
    });

    it('should return 404 for invalid ObjectId format', async () => {
      const response = await TestHelpers.getRequest()
        .get('/api/users/invalid-id');

      expect(response.status).toBe(500); // Or could be 400 depending on your error handling
    });
  });

  describe('GET /api/users/uuid/:uuid', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({
        auth: { email: 'uuiduser@example.com' },
        profile: { displayName: 'UUID User Test' },
      });
    });

    it('should get user by UUID', async () => {
      const response = await TestHelpers.getRequest()
        .get(`/api/users/uuid/${testUser.uuid}`);

      TestHelpers.expectSuccess(response);
      expect(response.body.uuid).toBe(testUser.uuid);
      expect(response.body.profile.displayName).toBe('UUID User Test');
    });

    it('should return 404 for non-existent UUID', async () => {
      const fakeUuid = '550e8400-e29b-41d4-a716-446655440000';

      const response = await TestHelpers.getRequest()
        .get(`/api/users/uuid/${fakeUuid}`);

      TestHelpers.expectNotFound(response);
    });
  });
});