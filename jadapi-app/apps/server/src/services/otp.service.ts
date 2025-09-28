import { Otp, OtpDoc } from "../models/Otp";
import { ApiError } from "../utils/ApiError";

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

    // Invalidate any existing unverified OTPs for this identifier and type
    await Otp.updateMany(
      { identifier, type, verified: false },
      { verified: true } // Mark as verified to effectively invalidate
    );

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new OTP
    const otp = await Otp.create({
      email,
      phoneNumber,
      identifier,
      code,
      type,
      deliveryMethod,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verified: false,
      attempts: 0,
    });

    return otp;
  },

  async verifyOtp(data: VerifyOtpData): Promise<{ success: boolean; otpId?: string }> {
    const { identifier, code, type = "signup" } = data;

    // Find the latest unverified OTP for this identifier and type
    // Also check if the identifier matches email or phoneNumber fields for backwards compatibility
    const otp = await Otp.findOne({
      $and: [
        {
          $or: [
            { identifier },
            { email: identifier },
            { phoneNumber: identifier }
          ]
        },
        { type },
        { verified: false },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });

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
    if (otp.code !== code) {
      throw new ApiError(400, "Invalid OTP code");
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    return { success: true, otpId: otp._id.toString() };
  },

  async isIdentifierVerified(identifier: string, type: "signup" | "login" | "password_reset" = "signup"): Promise<boolean> {
    const verifiedOtp = await Otp.findOne({
      $and: [
        {
          $or: [
            { identifier },
            { email: identifier },
            { phoneNumber: identifier }
          ]
        },
        { type },
        { verified: true },
        { createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } } // Valid for 30 minutes after verification
      ]
    });

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