/**
 * SMS Client Test Suite
 * Tests AWS SNS functionality with different scenarios
 */

import { smsService } from "../sms/SmsService";
import { getTwilioProvider } from "../sms/providers/TwilioProvider";

// Test configuration
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || "+16045551234"; // Replace with your actual phone
const DRY_RUN = process.env.DRY_RUN === "true"; // Set to false to actually send SMS

describe("SMS Client Tests", () => {

  beforeAll(() => {
    console.log("📱 SMS Testing Configuration:");
    console.log(`Test Phone: ${TEST_PHONE}`);
    console.log(`Dry Run Mode: ${DRY_RUN}`);
    console.log(`Twilio Account SID: ${process.env.TWILIO_ACCOUNT_SID ? "Set" : "Not Set"}`);

    if (DRY_RUN) {
      console.log("⚠️  DRY RUN MODE - No actual SMS will be sent");
    } else {
      console.log("🚨 LIVE MODE - Real SMS will be sent to your phone!");
    }
  });

  test("should send OTP SMS", async () => {
    const otpCode = "123456";

    if (DRY_RUN) {
      console.log(`Would send OTP ${otpCode} to ${TEST_PHONE}`);
      return;
    }

    try {
      await smsService.sendOtp(TEST_PHONE, otpCode, 5);
      console.log("✅ OTP SMS sent successfully");
    } catch (error) {
      console.error("❌ OTP SMS failed:", error);
      throw error;
    }
  }, 10000);

  test("should send delivery notification", async () => {
    const orderId = "TEST-001";
    const driverName = "Test Driver";

    if (DRY_RUN) {
      console.log(`Would send delivery notification for ${orderId} to ${TEST_PHONE}`);
      return;
    }

    try {
      await smsService.sendDeliveryStarted(TEST_PHONE, orderId, driverName);
      console.log("✅ Delivery notification sent successfully");
    } catch (error) {
      console.error("❌ Delivery notification failed:", error);
      throw error;
    }
  }, 10000);

  test("should send booking confirmation", async () => {
    const orderId = "TEST-002";
    const pickupTime = "Today at 3:00 PM";

    if (DRY_RUN) {
      console.log(`Would send booking confirmation for ${orderId} to ${TEST_PHONE}`);
      return;
    }

    try {
      await smsService.sendBookingConfirmation(TEST_PHONE, orderId, pickupTime);
      console.log("✅ Booking confirmation sent successfully");
    } catch (error) {
      console.error("❌ Booking confirmation failed:", error);
      throw error;
    }
  }, 10000);

  test("should send custom message", async () => {
    const customMessage = "This is a test message from jaddpi logistics platform.";

    if (DRY_RUN) {
      console.log(`Would send custom message to ${TEST_PHONE}: ${customMessage}`);
      return;
    }

    try {
      await smsService.sendCustomMessage(TEST_PHONE, customMessage);
      console.log("✅ Custom message sent successfully");
    } catch (error) {
      console.error("❌ Custom message failed:", error);
      throw error;
    }
  }, 10000);

  test("should handle invalid phone number gracefully", async () => {
    const invalidPhone = "invalid-phone";

    try {
      await smsService.sendOtp(invalidPhone, "123456");
      throw new Error("Should have failed with invalid phone");
    } catch (error: any) {
      console.log("✅ Correctly rejected invalid phone number");
      expect(error.message).toContain("InvalidParameter");
    }
  });

});

// Manual test runner (if not using Jest)
export async function runManualSmsTests() {
  console.log("🧪 Starting Manual SMS Tests\n");

  const tests = [
    {
      name: "OTP SMS",
      fn: () => smsService.sendOtp(TEST_PHONE, "123456", 5)
    },
    {
      name: "Delivery Started",
      fn: () => smsService.sendDeliveryStarted(TEST_PHONE, "TEST-001", "John Driver")
    },
    {
      name: "Booking Confirmation",
      fn: () => smsService.sendBookingConfirmation(TEST_PHONE, "TEST-002", "Today at 2:00 PM")
    },
    {
      name: "Custom Message",
      fn: () => smsService.sendCustomMessage(TEST_PHONE, "Test message from jaddpi SMS client")
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📤 Testing: ${test.name}`);

      if (DRY_RUN) {
        console.log(`  ⚠️  DRY RUN - Would execute ${test.name}`);
        continue;
      }

      await test.fn();
      console.log(`  ✅ ${test.name} - SUCCESS\n`);

      // Wait 2 seconds between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`  ❌ ${test.name} - FAILED:`, error.message);
      console.error(`     Error details:`, error);
    }
  }

  console.log("🏁 Manual SMS Tests Completed");
}