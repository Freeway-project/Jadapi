import { Request, Response, NextFunction } from "express";
import { UserService, SignupData } from "../services/user.service";
import { OtpService } from "../services/otp.service";
import { ApiError } from "../utils/ApiError";

export const UserController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountType, email, phone, displayName, legalName }: SignupData = req.body;

      // Validate required fields
      if (!accountType) {
        throw new ApiError(400, "Account type is required");
      }
      if (!displayName) {
        throw new ApiError(400, "Display name is required");
      }

      // Business accounts require legal name
      if (accountType === "business" && !legalName) {
        throw new ApiError(400, "Legal name is required for business accounts");
      }

      // For email signup, require OTP verification first
      if (email && !phone) {
        const isEmailVerified = await OtpService.isEmailVerified(email, "signup");
        if (!isEmailVerified) {
          throw new ApiError(400, "Email must be verified with OTP before signup. Please use /auth/otp/request first.");
        }
      }

      const signupData: SignupData = {
        accountType,
        email,
        phone,
        displayName,
        legalName,
      };

      const user = await UserService.signup(signupData);

      // If email was verified via OTP, mark it as verified in the user record
      if (email && await OtpService.isEmailVerified(email, "signup")) {
        await UserService.verifyEmail(user._id.toString());
      }

      // Return user without sensitive data
      const response = {
        uuid: user.uuid,
        accountType: user.accountType,
        roles: user.roles,
        status: user.status,
        profile: user.profile,
        auth: {
          email: user.auth.email,
          phone: user.auth.phone,
          emailVerifiedAt: user.auth.emailVerifiedAt,
          phoneVerifiedAt: user.auth.phoneVerifiedAt,
        },
        createdAt: user.createdAt,
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.get(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async getByUuid(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getByUuid(req.params.uuid);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit ?? 20);
      const skip = Number(req.query.skip ?? 0);
      const users = await UserService.list(limit, skip);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.verifyEmail(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ message: "Email verified successfully", emailVerifiedAt: user.auth.emailVerifiedAt });
    } catch (err) {
      next(err);
    }
  },

  async verifyPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.verifyPhone(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ message: "Phone verified successfully", phoneVerifiedAt: user.auth.phoneVerifiedAt });
    } catch (err) {
      next(err);
    }
  }
};
