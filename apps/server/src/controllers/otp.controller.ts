import { Request, Response, NextFunction } from "express";
import { OtpService, GenerateOtpData, VerifyOtpData } from "../services/otp.service";
import { EmailService } from "../services/email.service";
import { NotificationService } from "../services/notification.service";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";
import { jwtUtils } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

export const OtpController = {
  async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phoneNumber, type = "signup", deliveryMethod = "both" } = req.body;
      if (process.env.NODE_ENV === 'development') {
        console.log("Received OTP request:", { email, phoneNumber, type, deliveryMethod });
      }
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
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        if (digitsOnly.length < 10 || digitsOnly.length > 15) {
          throw new ApiError(400, "Phone number must have 10-15 digits");
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
        if (phoneNumber) {
          const existingUser = await UserRepository.findByPhoneNumber(phoneNumber);
          if (existingUser) {
            throw new ApiError(409, "Phone number already registered");
          }
        }
        

      }

      // Generate OTP
      const otpData: GenerateOtpData = { email, phoneNumber, type, deliveryMethod };
      const otp = await OtpService.generateOtp(otpData);

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ requestOtp ~ otp generated:', { id: otp._id, expiresAt: otp.expiresAt });
      }


      // Send response immediately, then send OTP asynchronously
      res.status(200).json({
        message: "OTP sent successfully",
        email: email || null,
        phoneNumber: phoneNumber || null,
        deliveryMethod,
        expiresAt: otp.expiresAt,
      });

      // Send OTP via email and/or SMS based on deliveryMethod (non-blocking)
      const sendPromises = [];

      if ((deliveryMethod === "email" || deliveryMethod === "both") && email) {
        sendPromises.push(
          EmailService.sendOtpEmail({
            email,
            code: otp.code,
            type,
          }).catch(err => {
            console.error('Failed to send OTP email:', err);
          })
        );
      }

      if ((deliveryMethod === "sms" || deliveryMethod === "both") && phoneNumber) {
        sendPromises.push(
          NotificationService.sendVerificationOtp(phoneNumber, otp.code).catch(err => {
            console.error('Failed to send OTP SMS:', err);
          })
        );
      }

      // Send in background (fire and forget)
      Promise.all(sendPromises).catch(err => {
        console.error('OTP sending failed:', err);
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
        let token = null;
        let user = null;

        // For login type, generate JWT token and return user data
        if (type === "login") {
          // Normalize identifier - lowercase if email, trim otherwise
          const normalizedIdentifier = identifier.includes('@')
            ? identifier.toLowerCase().trim()
            : identifier.trim();

          // Build flexible phone query to match different formats
          // If identifier is phone (no @), try to match with/without country code
          const isPhone = !identifier.includes('@');
          const phoneDigits = isPhone ? normalizedIdentifier.replace(/\D/g, '') : '';

          // Find user by identifier (email or phone)
          const query = {
            $or: [
              { "auth.email": normalizedIdentifier },
              { "auth.phone": normalizedIdentifier },
              ...(isPhone && phoneDigits ? [
                { "auth.phone": { $regex: phoneDigits + '$' } }, // Match phone ending with digits
                { "auth.phone": '+' + normalizedIdentifier }, // Try with +
                { "auth.phone": '+1' + normalizedIdentifier }, // Try with +1 (US/Canada)
              ] : [])
            ]
          };

          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Finding user with query:', JSON.stringify(query, null, 2));
          }

          user = await User.findOne(query).select("-password");

          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 User found:', user ? {
              uuid: user.uuid,
              'auth.email': user.auth?.email,
              'auth.phone': user.auth?.phone,
              status: user.status,
              roles: user.roles
            } : null);
          }

          if (user && user.status === "active") {
            token = jwtUtils.generateToken({
              userId: user._id.toString(),
              email: user.auth?.email,
              roles: user.roles || []
            });
          }
        }

        res.status(200).json({
          message: "OTP verified successfully",
          identifier,
          verified: true,
          otpId: result.otpId,
          token,
          user,
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