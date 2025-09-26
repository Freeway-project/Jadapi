import { Request, Response, NextFunction } from "express";
import { OtpService, GenerateOtpData, VerifyOtpData } from "../services/otp.service";
import { EmailService } from "../services/email.service";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";

export const OtpController = {
  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type = "signup" } = req.body;

      if (!email) {
        throw new ApiError(400, "Email is required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
      }

      // For signup, check if email already exists
      if (type === "signup") {
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
          throw new ApiError(409, "Email already registered");
        }
      }

      // Generate OTP
      const otpData: GenerateOtpData = { email, type };
      const otp = await OtpService.generateOtp(otpData);

      // Send OTP via email
      await EmailService.sendOtpEmail({
        email,
        code: otp.code,
        type,
      });

      res.status(200).json({
        message: "OTP sent successfully",
        email,
        expiresAt: otp.expiresAt,
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code, type = "signup" } = req.body;

      if (!email || !code) {
        throw new ApiError(400, "Email and OTP code are required");
      }

      // Verify OTP
      const verifyData: VerifyOtpData = { email, code, type };
      const result = await OtpService.verifyOtp(verifyData);

      if (result.success) {
        res.status(200).json({
          message: "OTP verified successfully",
          email,
          verified: true,
          otpId: result.otpId,
        });
      } else {
        throw new ApiError(400, "OTP verification failed");
      }
    } catch (err) {
      next(err);
    }
  },

  async checkVerificationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type = "signup" } = req.query;

      if (!email || typeof email !== "string") {
        throw new ApiError(400, "Email is required");
      }

      const isVerified = await OtpService.isEmailVerified(
        email,
        type as "signup" | "login" | "password_reset"
      );

      res.status(200).json({
        email,
        verified: isVerified,
        type,
      });
    } catch (err) {
      next(err);
    }
  },
};