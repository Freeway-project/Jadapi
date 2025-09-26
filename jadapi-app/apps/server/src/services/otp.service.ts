import { Otp, OtpDoc } from "../models/Otp";
import { ApiError } from "../utils/ApiError";

export interface GenerateOtpData {
  email: string;
  type?: "signup" | "login" | "password_reset";
}

export interface VerifyOtpData {
  email: string;
  code: string;
  type?: "signup" | "login" | "password_reset";
}

export const OtpService = {
  async generateOtp(data: GenerateOtpData): Promise<OtpDoc> {
    const { email, type = "signup" } = data;

    // Invalidate any existing unverified OTPs for this email and type
    await Otp.updateMany(
      { email, type, verified: false },
      { verified: true } // Mark as verified to effectively invalidate
    );

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new OTP
    const otp = await Otp.create({
      email,
      code,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verified: false,
      attempts: 0,
    });

    return otp;
  },

  async verifyOtp(data: VerifyOtpData): Promise<{ success: boolean; otpId?: string }> {
    const { email, code, type = "signup" } = data;

    // Find the latest unverified OTP for this email and type
    const otp = await Otp.findOne({
      email,
      type,
      verified: false,
      expiresAt: { $gt: new Date() },
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

  async isEmailVerified(email: string, type: "signup" | "login" | "password_reset" = "signup"): Promise<boolean> {
    const verifiedOtp = await Otp.findOne({
      email,
      type,
      verified: true,
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }, // Valid for 30 minutes after verification
    });

    return !!verifiedOtp;
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