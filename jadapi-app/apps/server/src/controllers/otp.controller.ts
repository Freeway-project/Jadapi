import { Request, Response, NextFunction } from "express";
import { OtpService, GenerateOtpData, VerifyOtpData } from "../services/otp.service";
import { EmailService } from "../services/email.service";
import { NotificationService } from "../services/notification.service";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";

export const OtpController = {
  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phoneNumber, type = "signup", deliveryMethod = "both" } = req.body;

      if (!email && !phoneNumber) {
        throw new ApiError(400, "Either email or phone number is required");
      }

      // Validate email format if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new ApiError(400, "Invalid email format");
        }
      }

      // Validate phone number format if provided
      if (phoneNumber) {
        const phoneRegex = /^(\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
        if (!phoneRegex.test(phoneNumber)) {
          throw new ApiError(400, "Invalid phone number format");
        }
      }

      // For signup, check if email or phone already exists
      if (type === "signup") {
        if (email) {
          const existingUser = await UserRepository.findByEmail(email);
          if (existingUser) {
            throw new ApiError(409, "Email already registered");
          }
        }
        // TODO: Add phone number check when UserRepository supports it
      }

      // Generate OTP
      const otpData: GenerateOtpData = { email, phoneNumber, type, deliveryMethod };
      const otp = await OtpService.generateOtp(otpData);

      // Send OTP via email and/or SMS based on deliveryMethod
      const sendPromises = [];

      if ((deliveryMethod === "email" || deliveryMethod === "both") && email) {
        sendPromises.push(
          EmailService.sendOtpEmail({
            email,
            code: otp.code,
            type,
          })
        );
      }

      if ((deliveryMethod === "sms" || deliveryMethod === "both") && phoneNumber) {
        sendPromises.push(
          NotificationService.sendVerificationOtp(phoneNumber, otp.code)
        );
      }

      // Wait for all send operations to complete
      await Promise.all(sendPromises);

      res.status(200).json({
        message: "OTP sent successfully",
        email: email || null,
        phoneNumber: phoneNumber || null,
        deliveryMethod,
        expiresAt: otp.expiresAt,
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, code, type = "signup" } = req.body;

      if (!identifier || !code) {
        throw new ApiError(400, "Identifier (email or phone) and OTP code are required");
      }

      // Verify OTP
      const verifyData: VerifyOtpData = { identifier, code, type };
      const result = await OtpService.verifyOtp(verifyData);

      if (result.success) {
        res.status(200).json({
          message: "OTP verified successfully",
          identifier,
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
      const { identifier, type = "signup" } = req.query;

      if (!identifier || typeof identifier !== "string") {
        throw new ApiError(400, "Identifier (email or phone) is required");
      }

      const isVerified = await OtpService.isIdentifierVerified(
        identifier,
        type as "signup" | "login" | "password_reset"
      );

      res.status(200).json({
        identifier,
        verified: isVerified,
        type,
      });
    } catch (err) {
      next(err);
    }
  },
};