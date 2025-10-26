#!/usr/bin/env node
/**
 * Standalone SMS Test Script
 * Run this script to test AWS SNS SMS functionality
 * 
 * Usage:
 * npm run test:sms
 * or
 * node dist/test-sms.js
 */

import dotenv from "dotenv";
import { 
  sendSms, 
  SmsHelpers, 
  SmsTemplates 
} from "../utils/SmsClient";

// Load environment variables
dotenv.config();

// Configuration
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || process.env.YOUR_PHONE_NUMBER;
const DRY_RUN = process.env.DRY_RUN !== "false"; // Default to dry run for safety

async function testAwsSns() {
  console.log("🚀 AWS SNS SMS Test Script");
  console.log("=" .repeat(50));
  
  // Validate configuration
  if (!TEST_PHONE) {
    console.error("❌ No test phone number provided!");
    console.log("Set TEST_PHONE_NUMBER in your .env file or environment variables");
    console.log("Example: TEST_PHONE_NUMBER=+16045551234");
    process.exit(1);
  }

  console.log(`📱 Test Phone: ${TEST_PHONE}`);
  console.log(`🔧 Dry Run: ${DRY_RUN ? "YES (Safe Mode)" : "NO (Will send real SMS)"}`);
  console.log(`🌍 AWS Region: ${process.env.AWS_REGION || "us-east-1"}`);
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn("⚠️  AWS credentials not found in environment");
    console.log("Make sure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set");
  }

  console.log("\n" + "=".repeat(50));
  
  if (DRY_RUN) {
    console.log("🟡 DRY RUN MODE - No real SMS will be sent");
    console.log("Set DRY_RUN=false in .env to send real SMS");
  } else {
    console.log("🔴 LIVE MODE - Real SMS will be sent!");
    console.log("Make sure the phone number is correct!");
  }
  
  console.log("\n⏳ Starting tests in 3 seconds...");
  await sleep(3000);

  const tests = [
    {
      name: "🔐 OTP Verification Code",
      test: async () => {
        const code = generateOtp();
        const message = SmsTemplates.otp(code, 5);
        console.log(`   Message: "${message}"`);
        
        if (!DRY_RUN) {
          await SmsHelpers.sendOtpCode(TEST_PHONE, code, 5);
        }
        return `OTP ${code}`;
      }
    },
    {
      name: "🚚 Delivery Started Notification",
      test: async () => {
        const orderId = "TEST-" + Date.now();
        const driver = "Alex Driver";
        const message = SmsTemplates.deliveryStarted(orderId, driver);
        console.log(`   Message: "${message}"`);
        
        if (!DRY_RUN) {
          await SmsHelpers.notifyDeliveryStarted(TEST_PHONE, orderId, driver);
        }
        return `Order ${orderId}`;
      }
    },
    {
      name: "✅ Delivery Completed",
      test: async () => {
        const orderId = "TEST-" + (Date.now() + 1);
        const message = SmsTemplates.deliveryCompleted(orderId);
        console.log(`   Message: "${message}"`);
        
        if (!DRY_RUN) {
          await SmsHelpers.notifyDeliveryCompleted(TEST_PHONE, orderId);
        }
        return `Order ${orderId}`;
      }
    },
    {
      name: "📋 Booking Confirmation", 
      test: async () => {
        const orderId = "BOOK-" + Date.now();
        const time = "Tomorrow at 2:00 PM";
        const message = SmsTemplates.bookingConfirmed(orderId, time);
        console.log(`   Message: "${message}"`);
        
        if (!DRY_RUN) {
          await SmsHelpers.confirmBooking(TEST_PHONE, orderId, time);
        }
        return `Booking ${orderId}`;
      }
    },
    {
      name: "💬 Custom Message",
      test: async () => {
        const message = "Hello from jaddpi! This is a test of our SMS system. 📱✨";
        console.log(`   Message: "${message}"`);
        
        if (!DRY_RUN) {
          await sendSms({
            phoneE164: TEST_PHONE,
            message,
            type: "transactional"
          });
        }
        return "Custom message";
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    
    try {
      console.log(`\n[${i + 1}/${tests.length}] ${test.name}`);
      
      const result = await test.test();
      
      if (DRY_RUN) {
        console.log(`   ✅ DRY RUN SUCCESS - ${result}`);
      } else {
        console.log(`   ✅ SMS SENT - ${result}`);
      }
      
      passed++;
      
      // Wait between tests to avoid rate limiting
      if (i < tests.length - 1) {
        console.log("   ⏱️  Waiting 2 seconds...");
        await sleep(2000);
      }
      
    } catch (error: any) {
      console.error(`   ❌ FAILED: ${error.message}`);
      
      if (error.code) {
        console.error(`      Error Code: ${error.code}`);
      }
      
      if (error.$metadata?.httpStatusCode) {
        console.error(`      HTTP Status: ${error.$metadata.httpStatusCode}`);
      }
      
      failed++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📱 Target Phone: ${TEST_PHONE}`);
  
  if (DRY_RUN) {
    console.log("\n🟡 This was a DRY RUN - no real SMS were sent");
    console.log("To test with real SMS, set DRY_RUN=false in your .env file");
  } else if (passed > 0) {
    console.log("\n🎉 Success! Check your phone for SMS messages");
  }
  
  if (failed > 0) {
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("1. Check AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)");
    console.log("2. Verify AWS SNS permissions");
    console.log("3. Confirm phone number format (+1XXXXXXXXXX)");
    console.log("4. Check AWS account SMS spending limits");
    console.log("5. Verify phone number is not in SMS opt-out list");
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testAwsSns().then(() => {
    console.log("\n👋 Test completed");
    process.exit(0);
  }).catch((error) => {
    console.error("\n💥 Test failed:", error);
    process.exit(1);
  });
}