import app from '../../src/app';
import { TestHelpers } from '../helpers/testHelpers';
import { User } from '../../src/models/user.model';

// Set up test helpers
TestHelpers.setApp(app);

describe('User Verification Endpoints', () => {
  let testUser: any;
  const testEmail = 'canadaharsh2002@gmail.com';

  beforeEach(async () => {
    // Create a test user for verification tests
    testUser = await TestHelpers.createTestUser({
      auth: {
        email: testEmail,
        emailVerifiedAt: null, // Not verified initially
        phoneVerifiedAt: null,
      },
      profile: {
        displayName: 'Verification Test User',
      },
    });
  });

  describe('POST /api/users/:id/verify-email', () => {
    it('should verify user email successfully', async () => {
      const response = await TestHelpers.getRequest()
        .post(`/api/users/${testUser._id}/verify-email`);

      TestHelpers.expectSuccess(response);
      expect(response.body).toMatchObject({
        message: 'Email verified successfully',
        emailVerifiedAt: expect.any(String),
      });

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.auth.emailVerifiedAt).toBeTruthy();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await TestHelpers.getRequest()
        .post(`/api/users/${fakeId}/verify-email`);

      TestHelpers.expectNotFound(response);
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await TestHelpers.getRequest()
        .post('/api/users/invalid-id/verify-email');

      TestHelpers.expectValidationError(response, 'user id');
    });
  });

  describe('POST /api/users/:id/verify-phone', () => {
    beforeEach(async () => {
      // Update test user to have a phone number
      testUser = await User.findByIdAndUpdate(
        testUser._id,
        { 'auth.phone': '+16045551234' },
        { new: true }
      );
    });

    it('should verify user phone successfully', async () => {
      const response = await TestHelpers.getRequest()
        .post(`/api/users/${testUser._id}/verify-phone`);

      TestHelpers.expectSuccess(response);
      expect(response.body).toMatchObject({
        message: 'Phone verified successfully',
        phoneVerifiedAt: expect.any(String),
      });

      // Verify in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.auth.phoneVerifiedAt).toBeTruthy();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await TestHelpers.getRequest()
        .post(`/api/users/${fakeId}/verify-phone`);

      TestHelpers.expectNotFound(response);
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await TestHelpers.getRequest()
        .post('/api/users/invalid-id/verify-phone');

      TestHelpers.expectValidationError(response, 'user id');
    });
  });
});