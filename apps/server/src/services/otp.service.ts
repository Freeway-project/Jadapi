import { Otp, OtpDoc } from "../models/Otp";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { normalizePhone } from "../utils/phoneNormalization";

export interface GenerateOtpData {
  email?: string;
  phoneNumber?: string;
  type?: "signup" | "login" | "password_reset";
  deliveryMethod?: "email" | "sms" | "both";
}

export interface VerifyOtpData {
  identifier: string; // can be email, phone, or combined identifier
  code: string;
  type?: "signup" | "login" | "password_reset";
}

export const OtpService = {
  async generateOtp(data: GenerateOtpData): Promise<OtpDoc> {
    const { email, phoneNumber, type = "signup", deliveryMethod = "both" } = data;

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ email, phoneNumber, type, deliveryMethod }, 'OtpService.generateOtp - input data');
    }

    if (!email && !phoneNumber) {
      throw new ApiError(400, "Either email or phone number is required");
    }

    // Normalize phone number to E.164 format
    const normalizedPhone = normalizePhone(phoneNumber);
    const normalizedEmail = email?.toLowerCase().trim();

    if (process.env.NODE_ENV === 'development') {
      logger.debug({
        originalPhone: phoneNumber,
        normalizedPhone,
        normalizedEmail
      }, 'OtpService.generateOtp - normalized data');
    }

    // Create a combined identifier for easier querying
    let identifier = "";
    if (normalizedEmail && normalizedPhone) {
      identifier = `${normalizedEmail}|${normalizedPhone}`;
    } else {
      identifier = normalizedEmail || normalizedPhone || "";
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ identifier }, 'OtpService.generateOtp - identifier created');
    }

    // Invalidate any existing unverified OTPs for this identifier and type
    const invalidatedCount = await Otp.updateMany(
      { identifier, type, verified: false, invalidated: false },
      { $set: { invalidated: true } }
    );

    if (process.env.NODE_ENV === 'development' && invalidatedCount.modifiedCount > 0) {
      logger.info({ count: invalidatedCount.modifiedCount, identifier, type }, 'OtpService.generateOtp - invalidated old OTPs');
    }

    // Also delete any invalidated OTPs from the previous 30 minutes to avoid confusion
    const deletedCount = await Otp.deleteMany({
      identifier,
      type,
      invalidated: true,
      createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) }
    });

    if (process.env.NODE_ENV === 'development' && deletedCount.deletedCount > 0) {
      logger.info({ count: deletedCount.deletedCount, identifier, type }, 'OtpService.generateOtp - deleted old invalidated OTPs');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ code: code.slice(0,2) + '****' }, 'OtpService.generateOtp - generated code');
    }

    // Create new OTP
    const otpData = {
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      identifier,
      code,
      type,
      deliveryMethod,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      verified: false,
      invalidated: false,
      attempts: 0,
    };

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ otpData: { ...otpData, code: code.slice(0,2) + '****' } }, 'OtpService.generateOtp - creating OTP');
    }

    const otp = await Otp.create(otpData);

    if (process.env.NODE_ENV === 'development') {
      logger.info({
        id: otp._id,
        identifier: otp.identifier,
        code: otp.code.slice(0,2) + '****',
        expiresAt: otp.expiresAt
      }, '✅ OtpService.generateOtp - OTP created successfully');
    }

    return otp;
  },

  async verifyOtp(data: VerifyOtpData): Promise<{ success: boolean; otpId?: string }> {
    const { identifier, code, type = "signup" } = data;

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ identifier, code: code?.length ? `${code.slice(0,2)}****` : 'empty', type }, 'OtpService.verifyOtp - input data');
    }

    // Normalize identifier - lowercase if it looks like an email, normalize phone otherwise
    const normalizedIdentifier = identifier.includes('@')
      ? identifier.toLowerCase().trim()
      : normalizePhone(identifier) || identifier.trim();

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ original: identifier, normalized: normalizedIdentifier }, 'OtpService.verifyOtp - normalized identifier');
    }

    // Find the latest unverified, non-invalidated OTP for this identifier and type
    const query = {
      $and: [
        {
          $or: [
            { identifier: normalizedIdentifier },
            { email: normalizedIdentifier },
            { phoneNumber: normalizedIdentifier }
          ]
        },
        { type },
        { verified: false },
        { invalidated: false }
      ]
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ query }, 'OtpService.verifyOtp - query');
    }

    const otp = await Otp.findOne(query).sort({ createdAt: -1 });

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ otp: otp ? {
        id: otp._id,
        identifier: otp.identifier,
        email: otp.email,
        phoneNumber: otp.phoneNumber,
        code: otp.code?.slice(0,2) + '****',
        type: otp.type,
        verified: otp.verified,
        invalidated: otp.invalidated,
        attempts: otp.attempts,
        expiresAt: otp.expiresAt,
        createdAt: otp.createdAt
      } : null }, 'OtpService.verifyOtp - found OTP');
    }

    if (!otp) {
      throw new ApiError(400, "No OTP found for this identifier. Please request a new one.");
    }

    // Check if invalidated
    if (otp.invalidated) {
      throw new ApiError(400, "This OTP is no longer valid. Please request a new one.");
    }

    // Check if expired
    if (otp.expiresAt < new Date()) {
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    // Check attempts limit
    if (otp.attempts >= 5) {
      throw new ApiError(429, "Too many failed attempts. Please request a new OTP.");
    }

    // Increment attempts
    otp.attempts += 1;
    await otp.save();

    // Verify code
    if (process.env.NODE_ENV === 'development') {
      logger.debug({ provided: code, stored: otp.code, match: otp.code === code }, 'OtpService.verifyOtp - code comparison');
    }

    if (otp.code !== code) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('❌ OtpService.verifyOtp - code mismatch - throwing error');
      }
      throw new ApiError(400, "Incorrect OTP code. Please try again.");
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    if (process.env.NODE_ENV === 'development') {
      logger.info('✅ OtpService.verifyOtp - success - OTP verified');
    }
    return { success: true, otpId: otp._id.toString() };
  },

  async isIdentifierVerified(identifier: string, type: "signup" | "login" | "password_reset" = "signup"): Promise<boolean> {
    if (process.env.NODE_ENV === 'development') {
      logger.debug({ identifier, type }, 'OtpService.isIdentifierVerified - checking');
    }

    // Normalize identifier - lowercase if it looks like an email, normalize phone otherwise
    const normalizedIdentifier = identifier.includes('@')
      ? identifier.toLowerCase().trim()
      : normalizePhone(identifier) || identifier.trim();

    const query = {
      $and: [
        {
          $or: [
            { identifier: normalizedIdentifier },
            { email: normalizedIdentifier },
            { phoneNumber: normalizedIdentifier }
          ]
        },
        { type },
        { verified: true },
        { invalidated: false },
        { createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } } // Valid for 5 minutes after verification
      ]
    };

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ query }, 'OtpService.isIdentifierVerified - query');
    }

    const verifiedOtp = await Otp.findOne(query);

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ result: verifiedOtp ? {
        id: verifiedOtp._id,
        identifier: verifiedOtp.identifier,
        email: verifiedOtp.email,
        phoneNumber: verifiedOtp.phoneNumber,
        verified: verifiedOtp.verified,
        invalidated: verifiedOtp.invalidated,
        createdAt: verifiedOtp.createdAt
      } : null }, 'OtpService.isIdentifierVerified - result');
    }

    return !!verifiedOtp;
  },

  // Keep for backwards compatibility
  async isEmailVerified(email: string, type: "signup" | "login" | "password_reset" = "signup"): Promise<boolean> {
    return this.isIdentifierVerified(email, type);
  },

  async getOtpById(id: string): Promise<OtpDoc | null> {
    return Otp.findById(id);
  },

  async cleanupExpiredOtps(): Promise<void> {
    const result = await Otp.deleteMany({
      $or: [
        { invalidated: true },
        { expiresAt: { $lt: new Date() } }
      ]
    });

    if (process.env.NODE_ENV === 'development') {
      logger.info({ deletedCount: result.deletedCount }, 'OtpService.cleanupExpiredOtps - cleanup complete');
    }

    return;
  },
};