#!/usr/bin/env node
/**
 * Test OTP Flow - Request, Verify, and Login
 * This script tests the complete OTP verification flow
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { OtpService } from "../services/otp.service";
import { User } from "../models/user.model";
import { normalizePhone } from "../utils/phoneNormalization";
import { jwtUtils } from "../utils/jwt";

dotenv.config();

const TEST_PHONE = "7785832260"; // Without +1 prefix
const TEST_PHONE_NORMALIZED = "+17785832260"; // With +1 prefix

async function testOtpFlow() {
  try {
    console.log("🧪 Testing OTP Flow\n");
    console.log("=".repeat(60));

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jadapi";
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Check if user exists
    console.log("Step 1: Checking if user exists...");
    console.log(`  Phone (input): ${TEST_PHONE}`);
    console.log(`  Phone (normalized): ${normalizePhone(TEST_PHONE)}\n`);

    const userQuery = {
      $or: [
        { "auth.phone": normalizePhone(TEST_PHONE) },
        { "auth.phone": TEST_PHONE }
      ]
    };
    console.log("  Query:", JSON.stringify(userQuery, null, 2));

    const user = await User.findOne(userQuery).select("-password");

    if (!user) {
      console.log("❌ User NOT found in database");
      console.log("\nSearching all users with phone numbers:");
      const allUsers = await User.find({ "auth.phone": { $exists: true } }).select("uuid auth.phone auth.email");
      console.log(`  Found ${allUsers.length} users with phone numbers:`);
      allUsers.forEach(u => {
        console.log(`    - ${u.uuid}: ${u.auth?.phone} (${u.auth?.email})`);
      });
      return;
    }

    console.log("✅ User found:");
    console.log(`  UUID: ${user.uuid}`);
    console.log(`  Email: ${user.auth?.email}`);
    console.log(`  Phone: ${user.auth?.phone}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  Roles: ${user.roles?.join(", ")}\n`);

    // Step 2: Generate OTP
    console.log("Step 2: Generating OTP...");
    const otp = await OtpService.generateOtp({
      phoneNumber: TEST_PHONE,
      type: "login",
      deliveryMethod: "sms"
    });

    console.log("✅ OTP generated:");
    console.log(`  ID: ${otp._id}`);
    console.log(`  Code: ${otp.code}`);
    console.log(`  Identifier: ${otp.identifier}`);
    console.log(`  Phone: ${otp.phoneNumber}`);
    console.log(`  Expires at: ${otp.expiresAt}`);
    console.log(`  Type: ${otp.type}\n`);

    // Step 3: Verify OTP
    console.log("Step 3: Verifying OTP...");
    const verifyResult = await OtpService.verifyOtp({
      identifier: TEST_PHONE,
      code: otp.code,
      type: "login"
    });

    console.log("✅ OTP verified:");
    console.log(`  Success: ${verifyResult.success}`);
    console.log(`  OTP ID: ${verifyResult.otpId}\n`);

    // Step 4: Simulate controller logic - Find user and generate token
    console.log("Step 4: Simulating controller login logic...");
    const normalizedIdentifier = normalizePhone(TEST_PHONE);
    console.log(`  Normalized identifier: ${normalizedIdentifier}`);

    const loginQuery = {
      $or: [
        { "auth.email": normalizedIdentifier },
        { "auth.phone": normalizedIdentifier }
      ]
    };
    console.log(`  Query: ${JSON.stringify(loginQuery, null, 2)}`);

    const loginUser = await User.findOne(loginQuery).select("-password");

    if (!loginUser) {
      console.log("❌ User NOT found during login!");
      console.log("\nDebugging:");
      console.log(`  Looking for phone: ${normalizedIdentifier}`);
      const debugUser = await User.findOne({ "auth.phone": normalizedIdentifier });
      console.log(`  Direct query result: ${debugUser ? "FOUND" : "NOT FOUND"}`);
      return;
    }

    console.log("✅ User found for login:");
    console.log(`  UUID: ${loginUser.uuid}`);
    console.log(`  Status: ${loginUser.status}\n`);

    // Step 5: Generate JWT token
    console.log("Step 5: Generating JWT token...");
    const token = jwtUtils.generateToken({
      userId: loginUser._id.toString(),
      email: loginUser.auth?.email,
      phone: loginUser.auth?.phone,
      roles: loginUser.roles || []
    });

    console.log("✅ Token generated:");
    console.log(`  Token: ${token.substring(0, 50)}...`);
    console.log(`  Length: ${token.length} chars\n`);

    // Step 6: Verify token
    console.log("Step 6: Verifying token...");
    const decoded = jwtUtils.verifyToken(token);
    if (decoded) {
      console.log("✅ Token valid:");
      console.log(`  User ID: ${decoded.userId}`);
      console.log(`  Email: ${decoded.email}`);
      console.log(`  Phone: ${decoded.phone}`);
      console.log(`  Roles: ${decoded.roles?.join(", ")}\n`);
    } else {
      console.log("❌ Token verification failed\n");
    }

    // Final Summary
    console.log("=".repeat(60));
    console.log("📊 FINAL RESPONSE (What API should return):");
    console.log("=".repeat(60));
    const apiResponse = {
      message: "OTP verified successfully",
      identifier: TEST_PHONE,
      verified: true,
      otpId: verifyResult.otpId,
      token: token,
      user: {
        _id: loginUser._id,
        uuid: loginUser.uuid,
        auth: loginUser.auth,
        profile: loginUser.profile,
        roles: loginUser.roles,
        status: loginUser.status,
        accountType: loginUser.accountType
      }
    };
    console.log(JSON.stringify(apiResponse, null, 2));

    console.log("\n✅ All tests passed!");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the test
if (require.main === module) {
  testOtpFlow()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}

export { testOtpFlow };
