export const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: 'production',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || '',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    },
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    sessionSecret: process.env.SESSION_SECRET || '',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || [],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Email Configuration
  email: {
    provider: 'sendgrid', // or 'smtp'
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || '',
      fromName: process.env.SENDGRID_FROM_NAME || 'Jaddpi',
    },
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || '',
    },
  },

  // SMS Configuration
  sms: {
    // AWS configuration removed
  },

  // External APIs
  apis: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    },
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'error',
    format: process.env.LOG_FORMAT || 'json',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    destination: process.env.UPLOAD_DEST || './uploads',
  },

  // Health Check
  health: {
    token: process.env.HEALTH_CHECK_TOKEN || '',
  },

  // OTP Configuration
  otp: {
    expirationMinutes: 10,
    codeLength: 6,
    maxAttempts: 5,
    verificationWindowMinutes: 30,
  },

  // Validation
  validate() {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'SESSION_SECRET',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      // Do not throw here: some deployments provide envs via external secret managers
      // or CI; warn so the process can still start and operators can inspect logs.
      // eslint-disable-next-line no-console
      console.warn(`Missing environment variables: ${missing.join(', ')}. Provide them via .env.production or environment.`);
    }

    // Warn about short secrets rather than throwing
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      // eslint-disable-next-line no-console
      console.warn('JWT_SECRET is shorter than recommended (32 chars).');
    }

    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      // eslint-disable-next-line no-console
      console.warn('SESSION_SECRET is shorter than recommended (32 chars).');
    }

    return missing;
  },
};

// Note: we intentionally don't validate automatically on import. Call `productionConfig.validate()`
// from your startup script or deployment checks if you want to enforce required envs.