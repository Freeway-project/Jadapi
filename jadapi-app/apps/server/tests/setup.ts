import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);

  console.log('🧪 Test database connected');
});

afterAll(async () => {
  // Close database connection and stop MongoDB instance
  await mongoose.disconnect();
  await mongoServer.stop();

  console.log('🧪 Test database disconnected');
});

beforeEach(async () => {
  // Clean all collections before each test
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Mock email service for tests
jest.mock('../src/services/email.service', () => ({
  EmailService: {
    sendOtpEmail: jest.fn().mockResolvedValue(undefined),
    sendTemplatedEmail: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(undefined),
    testEmailConfiguration: jest.fn().mockResolvedValue(true),
    getAvailableTemplates: jest.fn().mockReturnValue(['otp-signup', 'otp-login', 'otp-password-reset']),
    getSubjectByType: jest.fn().mockImplementation((type: string) => {
      switch (type) {
        case 'signup': return 'Verify Your Email - Signup OTP';
        case 'login': return 'Your Login Verification Code';
        case 'password_reset': return 'Reset Your Password - Verification Code';
        default: return 'Your Verification Code';
      }
    }),
  },
}));

// Mock delivery area validator for tests
jest.mock('../src/utils/deliveryAreaValidator', () => ({
  DeliveryAreaValidator: {
    validateAddress: jest.fn().mockResolvedValue({
      isValid: true,
      reasons: [],
      availableServices: {
        delivery: true,
        pickup: true,
        sameDay: true,
        nextDay: true,
        express: false,
      },
      serviceArea: null,
    }),
  },
}));

// Increase test timeout for integration tests
jest.setTimeout(30000);