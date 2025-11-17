import { Request, Response, NextFunction } from "express";
import { OtpService, GenerateOtpData, VerifyOtpData } from "../services/otp.service";
import { EmailService } from "../services/email.service";
import { NotificationService } from "../services/notification.service";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";
import { jwtUtils } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { normalizePhone } from "../utils/phoneNormalization";

export const OtpController = {
  async requestEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type = "signup" } = req.body;
      if (process.env.NODE_ENV === 'development') {
        console.log("Received Email OTP request:", { email, type });
      }
      if (!email) {
        throw new ApiError(400, "Email is required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
      }

      // Validate type
      if (!['signup', 'login', 'password_reset'].includes(type)) {
        throw new ApiError(400, "Invalid type. Must be signup, login, or password_reset");
      }

      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();

      // For signup, check if email already exists
      if (type === "signup") {
        const existingUser = await UserRepository.findByEmail(normalizedEmail);
        if (existingUser) {
          throw new ApiError(409, "Email already registered");
        }
      }

      // Generate OTP
      const otpData: GenerateOtpData = { email: normalizedEmail, type, deliveryMethod: "email" };
      const otp = await OtpService.generateOtp(otpData);

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ requestEmailOtp ~ otp generated:', { id: otp._id, code: otp.code.slice(0,2) + '****', expiresAt: otp.expiresAt });
      }

      // Send OTP via email BEFORE responding to client to ensure it's sent
      try {
        await EmailService.sendOtpEmail({
          email: normalizedEmail,
          code: otp.code,
          type,
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ ~ requestEmailOtp ~ Email sent successfully');
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send OTP email:', emailError);
        // Continue anyway - let client know email failed
      }

      // Send response after email is sent
      res.status(200).json({
        message: "OTP sent successfully to email",
        email: normalizedEmail,
        expiresAt: otp.expiresAt,
      });
    } catch (err) {
      next(err);
    }
  },

  async requestPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phoneNumber, type = "signup" } = req.body;
      if (process.env.NODE_ENV === 'development') {
        console.log("Received Phone OTP request:", { phoneNumber, type });
      }
      if (!phoneNumber) {
        throw new ApiError(400, "Phone number is required");
      }

      // Validate type
      if (!['signup', 'login', 'password_reset'].includes(type)) {
        throw new ApiError(400, "Invalid type. Must be signup, login, or password_reset");
      }

      // Normalize phone number - this will validate format
      const normalizedPhone = normalizePhone(phoneNumber);

      if (!normalizedPhone) {
        throw new ApiError(400, "Invalid phone number format");
      }

      // For signup, check if phone already exists
      if (type === "signup") {
        const existingUser = await UserRepository.findByPhoneNumber(normalizedPhone);
        if (existingUser) {
          throw new ApiError(409, "Phone number already registered");
        }
      }

      // Generate OTP
      const otpData: GenerateOtpData = { phoneNumber: normalizedPhone, type, deliveryMethod: "sms" };
      const otp = await OtpService.generateOtp(otpData);

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ requestPhoneOtp ~ otp generated:', { id: otp._id, code: otp.code.slice(0,2) + '****', expiresAt: otp.expiresAt });
      }

      // Send OTP via SMS BEFORE responding to client to ensure it's sent
      try {
        await NotificationService.sendVerificationOtp(normalizedPhone, otp.code);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ ~ requestPhoneOtp ~ SMS sent successfully');
        }
      } catch (smsError) {
        console.error('⚠️ Failed to send OTP SMS:', smsError);
        // Continue anyway - let client know SMS failed
      }

      // Send response after SMS is sent
      res.status(200).json({
        message: "OTP sent successfully to phone",
        phoneNumber: normalizedPhone,
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

      // Validate type
      if (!['signup', 'login', 'password_reset'].includes(type)) {
        throw new ApiError(400, "Invalid type. Must be signup, login, or password_reset");
      }

      // Verify OTP
      const verifyData: VerifyOtpData = { identifier, code, type };
      const result = await OtpService.verifyOtp(verifyData);

      if (result.success) {
        let token = null;
        let user = null;

        // For login type, generate JWT token and return user data
        if (type === "login") {
          // Normalize identifier - lowercase if email, normalize phone otherwise
          const normalizedIdentifier = identifier.includes('@')
            ? identifier.toLowerCase().trim()
            : normalizePhone(identifier) || identifier.trim();

          // Find user by identifier (email or phone)
          const query = {
            $or: [
              { "auth.email": normalizedIdentifier },
              { "auth.phone": normalizedIdentifier }
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

  async checkAccountExists(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, phoneNumber } = req.body;

      if (!email && !phoneNumber) {
        throw new ApiError(400, "Email or phone number is required");
      }

      const checks: { email?: boolean; phone?: boolean } = {};

      // Check email if provided
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new ApiError(400, "Invalid email format");
        }
        const existingEmail = await UserRepository.findByEmail(email);
        checks.email = !!existingEmail;
      }

      // Check phone if provided
      if (phoneNumber) {
        const normalizedPhone = normalizePhone(phoneNumber);
        if (normalizedPhone) {
          const existingPhone = await UserRepository.findByPhoneNumber(normalizedPhone);
          checks.phone = !!existingPhone;
        }
      }

      res.status(200).json({
        exists: checks.email || checks.phone,
        details: checks,
      });
    } catch (err) {
      next(err);
    }
  },
};