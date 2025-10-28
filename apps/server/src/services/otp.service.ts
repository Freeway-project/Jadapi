import { Otp, OtpDoc } from "../models/Otp";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

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

    // Create a combined identifier for easier querying
    let identifier = "";
    if (email && phoneNumber) {
      identifier = `${email}|${phoneNumber}`;
    } else {
      identifier = email || phoneNumber || "";
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ identifier }, 'OtpService.generateOtp - identifier created');
    }

    // Invalidate any existing unverified OTPs for this identifier and type
    await Otp.updateMany(
      { identifier, type, verified: false },
      { verified: true } // Mark as verified to effectively invalidate
    );

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ code: code.slice(0,2) + '****' }, 'OtpService.generateOtp - generated code');
    }

    // Create new OTP
    const otpData = {
      email,
      phoneNumber,
      identifier,
      code,
      type,
      deliveryMethod,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verified: false,
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

    // Normalize identifier - lowercase if it looks like an email
    const normalizedIdentifier = identifier.includes('@')
      ? identifier.toLowerCase().trim()
      : identifier.trim();

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ original: identifier, normalized: normalizedIdentifier }, 'OtpService.verifyOtp - normalized identifier');
    }

    // Find the latest unverified OTP for this identifier and type
    // Also check if the identifier matches email or phoneNumber fields for backwards compatibility
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
        { expiresAt: { $gt: new Date() } }
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
        attempts: otp.attempts,
        expiresAt: otp.expiresAt,
        createdAt: otp.createdAt
      } : null }, 'OtpService.verifyOtp - found OTP');
    }

    if (!otp) {
      throw new ApiError(400, "Invalid or expired OTP code");
    }

    // Check attempts limit
    if (otp.attempts >= 5) {
      throw new ApiError(429, "Too many failed attempts. Please request a new OTP");
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
      throw new ApiError(400, "Invalid OTP code");
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

    // Normalize identifier - lowercase if it looks like an email
    const normalizedIdentifier = identifier.includes('@')
      ? identifier.toLowerCase().trim()
      : identifier.trim();

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
        { createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } } // Valid for 30 minutes after verification
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
    await Otp.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  },
};