# API Testing Suite

This directory contains comprehensive test suites for all API endpoints using Jest and Supertest.

## 🧪 Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── teardown.ts                 # Global test teardown
├── helpers/
│   └── testHelpers.ts          # Utility functions for testing
├── fixtures/
│   └── testData.ts             # Test data and constants
├── integration/                # Integration tests
│   ├── otp.test.ts            # OTP endpoint tests
│   ├── user.test.ts           # User management tests
│   ├── verification.test.ts    # Email/Phone verification tests
│   └── signup-flow.test.ts    # Complete signup flow tests
└── README.md                  # This file
```

## 🚀 Running Tests

### All Tests
```bash
npm test                    # Run all tests
npm run test:coverage      # Run with coverage report
npm run test:watch         # Run in watch mode
npm run test:ci           # CI-friendly test run
```

### Specific Test Suites
```bash
npm run test:otp          # OTP endpoints only
npm run test:user         # User management only
npm run test:verification # Email/phone verification only
npm run test:signup-flow  # Complete signup flow only
```

## 📧 Test Email Configuration

The tests use the email: **canadaharsh2002@gmail.com**

### Test Scenarios Covered:

#### OTP Endpoints (`/api/auth/otp/*`)
- ✅ Request OTP for signup, login, password reset
- ✅ Verify OTP with correct/incorrect codes
- ✅ Handle expired OTPs and rate limiting
- ✅ Email format validation
- ✅ OTP status checking

#### User Signup (`/api/auth/signup`)
- ✅ Individual user signup with email verification
- ✅ Business user signup with legal name
- ✅ Phone-only signup (no OTP required)
- ✅ Dual email+phone signup
- ✅ Validation errors and duplicate prevention

#### User Management (`/api/users/*`)
- ✅ List users with pagination
- ✅ Get user by ID and UUID
- ✅ User verification endpoints
- ✅ Error handling for non-existent users

#### Complete Integration Flow
- ✅ End-to-end signup: OTP request → verify → signup
- ✅ Business signup with all validations
- ✅ Error scenarios and edge cases
- ✅ Rate limiting and security features

## 🛠️ Test Features

### Database Management
- **In-memory MongoDB**: Tests use MongoDB Memory Server
- **Clean State**: Database is reset between each test
- **Isolation**: Tests run in isolation without side effects

### Mocking
- **Email Service**: Mocked to prevent actual email sending
- **Delivery Validator**: Mocked for address validation
- **Template Service**: Mocked for email templates

### Assertions
- **Response Validation**: Status codes, response structure
- **Database Validation**: Data persistence checks
- **Business Logic**: Workflow validation
- **Error Handling**: Comprehensive error scenario testing

## 📊 Test Coverage

The test suite covers:
- **API Endpoints**: All routes and HTTP methods
- **Validation**: Input validation and error responses
- **Business Logic**: OTP verification, user creation, etc.
- **Database Operations**: CRUD operations and constraints
- **Integration**: End-to-end user journeys

## 🔧 Test Utilities

### TestHelpers Class
```typescript
// Create test users
await TestHelpers.createTestUser({ auth: { email: 'test@example.com' } });

// API requests
await TestHelpers.requestOtp('test@example.com', 'signup');
await TestHelpers.verifyOtp('test@example.com', '123456', 'signup');
await TestHelpers.signupUser({ accountType: 'individual', ... });

// Assertions
TestHelpers.expectOtpResponse(response);
TestHelpers.expectUserResponse(response);
TestHelpers.expectValidationError(response, 'email');
```

### Test Data Fixtures
```typescript
// Pre-defined test data
TEST_USERS.individual    // Individual user data
TEST_USERS.business      // Business user data
INVALID_TEST_DATA.users  // Invalid user data for error testing
```

## 🚫 Test Exclusions

These items are mocked in tests:
- Actual email sending (logged to console)
- External API calls (Google Maps, etc.)
- File system operations for templates
- Real-time features

## 🐛 Debugging Tests

### Verbose Output
```bash
npm run test:otp -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="should send OTP for valid email"
```

### Coverage Report
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

## 📝 Writing New Tests

1. **Add to appropriate test file** in `tests/integration/`
2. **Use TestHelpers** for common operations
3. **Follow naming convention**: `describe` → `it` structure
4. **Clean up state** using `beforeEach`/`afterEach` if needed
5. **Add test data** to `fixtures/testData.ts` if reusable

### Example Test Structure
```typescript
describe('New Endpoint', () => {
  describe('Success Cases', () => {
    it('should handle valid request', async () => {
      // Arrange
      const testData = { ... };

      // Act
      const response = await TestHelpers.getRequest()
        .post('/api/new-endpoint')
        .send(testData);

      // Assert
      TestHelpers.expectSuccess(response);
      expect(response.body).toMatchObject({ ... });
    });
  });

  describe('Error Cases', () => {
    it('should reject invalid input', async () => {
      const response = await TestHelpers.getRequest()
        .post('/api/new-endpoint')
        .send({ invalid: 'data' });

      TestHelpers.expectValidationError(response, 'field');
    });
  });
});
```

## 🔄 Continuous Integration

The test suite is designed for CI/CD:
- **Deterministic**: Tests produce consistent results
- **Fast**: In-memory database for speed
- **Isolated**: No external dependencies
- **Comprehensive**: High test coverage

Use `npm run test:ci` for CI environments.