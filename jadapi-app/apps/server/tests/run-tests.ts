#!/usr/bin/env ts-node

/**
 * Test Runner Script
 *
 * This script helps run specific test suites or all tests.
 * Usage:
 *   npm test                    # Run all tests
 *   npm run test:otp           # Run OTP tests only
 *   npm run test:user          # Run User tests only
 *   npm run test:signup-flow   # Run complete signup flow tests
 *   npm run test:watch         # Run tests in watch mode
 */

import { execSync } from 'child_process';

const TEST_SUITES = {
  otp: 'tests/integration/otp.test.ts',
  user: 'tests/integration/user.test.ts',
  verification: 'tests/integration/verification.test.ts',
  'signup-flow': 'tests/integration/signup-flow.test.ts',
  all: 'tests/',
};

function runTest(suite: string) {
  const testPath = TEST_SUITES[suite as keyof typeof TEST_SUITES];

  if (!testPath) {
    console.error(`❌ Unknown test suite: ${suite}`);
    console.log('Available suites:', Object.keys(TEST_SUITES).join(', '));
    process.exit(1);
  }

  try {
    console.log(`🧪 Running ${suite} tests...`);
    execSync(`jest ${testPath} --verbose`, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    console.log(`✅ ${suite} tests completed successfully`);
  } catch (error) {
    console.error(`❌ ${suite} tests failed`);
    process.exit(1);
  }
}

// Get test suite from command line argument
const suite = process.argv[2] || 'all';
runTest(suite);