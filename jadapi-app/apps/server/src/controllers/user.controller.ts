import { Request, Response, NextFunction } from "express";
import { UserService, SignupData } from "../services/user.service";
import { OtpService } from "../services/otp.service";
import { ApiError } from "../utils/ApiError";

export const UserController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountType, email, phone, name, address, businessName, gstNumber }: SignupData = req.body;

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ signup ~ input data:', { accountType, email, phone, name, address, businessName, gstNumber });
      }

      // Validate required fields
      if (!accountType) {
        throw new ApiError(400, "Account type is required");
      }

      // Name and address are now mandatory
      if (!name || name.trim().length < 2) {
        throw new ApiError(400, "Name is required and must be at least 2 characters");
      }

      if (!address || address.trim().length < 10) {
        throw new ApiError(400, "Address is required");
      }

      // Verification requirements based on account type
      if (accountType === "business") {
        // Business accounts require BOTH email and phone verification
        if (!email || !phone) {
          throw new ApiError(400, "Business accounts require both email and phone number.");
        }

        const isEmailVerified = await OtpService.isEmailVerified(email, "signup");
        const isPhoneVerified = await OtpService.isIdentifierVerified(phone, "signup");

        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 ~ signup ~ business verification status:', {
            email, emailVerified: isEmailVerified,
            phone, phoneVerified: isPhoneVerified
          });
        }

        if (!isEmailVerified) {
          throw new ApiError(400, "Business email must be verified with OTP before signup.");
        }

        if (!isPhoneVerified) {
          throw new ApiError(400, "Business phone number must be verified with OTP before signup.");
        }
      } else {
        // Individual accounts - at least one identifier must be verified
        let verificationChecked = false;

        if (email) {
          const isEmailVerified = await OtpService.isEmailVerified(email, "signup");
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 ~ signup ~ individual email verification status:', { email, verified: isEmailVerified });
          }

          if (!isEmailVerified) {
            throw new ApiError(400, "Email must be verified with OTP before signup.");
          }
          verificationChecked = true;
        }

        if (phone) {
          const isPhoneVerified = await OtpService.isIdentifierVerified(phone, "signup");
          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 ~ signup ~ individual phone verification status:', { phone, verified: isPhoneVerified });
          }

          if (!isPhoneVerified) {
            throw new ApiError(400, "Phone number must be verified with OTP before signup.");
          }
          verificationChecked = true;
        }

        if (!verificationChecked) {
          throw new ApiError(400, "At least one contact method (email or phone) must be provided and verified.");
        }
      }

      const signupData: SignupData = {
        accountType,
        email,
        phone,
        name,
        address,
        businessName,
        gstNumber,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ signup ~ calling UserService.signup with:', signupData);
      }

      const user = await UserService.signup(signupData);

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 ~ signup ~ user created:', {
          id: user._id,
          uuid: user.uuid,
          accountType: user.accountType,
          email: user.auth?.email,
          phone: user.auth?.phone
        });
      }

      // Mark verified identifiers in the user record
      if (email && await OtpService.isEmailVerified(email, "signup")) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 ~ signup ~ marking email as verified for user');
        }
        await UserService.verifyEmail(user._id.toString());
      }

      if (phone && await OtpService.isIdentifierVerified(phone, "signup")) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 ~ signup ~ marking phone as verified for user');
        }
        await UserService.verifyPhone(user._id.toString());
      }

      // Create session for the user
      // req.session.userId = user._id.toString();

      // Return user without sensitive data
      const response = {
        _id: user._id,
        uuid: user.uuid,
        accountType: user.accountType,
        roles: user.roles,
        status: user.status,
        profile: user.profile,
        businessProfile: user.businessProfile,
        email: user.auth?.email,
        phone: user.auth?.phone,
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
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id || req.user?._id || req.user?.id;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const { name, address, businessName, gstNumber } = req.body;

      const user = await UserService.updateProfile(userId, {
        name,
        address,
        businessName,
        gstNumber
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({
        message: "Profile updated successfully",
        profile: user.profile,
        businessProfile: user.businessProfile
      });
    } catch (err) {
      next(err);
    }
  },

  async searchByIdentifier(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.query;

      if (!identifier || typeof identifier !== 'string') {
        throw new ApiError(400, "Identifier (email or phone) is required");
      }

      // Search by email or phone
      const user = await UserService.findByIdentifier(identifier);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without sensitive data
      const response = {
        _id: user._id,
        uuid: user.uuid,
        accountType: user.accountType,
        email: user.auth?.email,
        phone: user.auth?.phone,
        profile: user.profile,
        businessProfile: user.businessProfile,
        roles: user.roles,
        status: user.status,
      };

      res.json({ user: response });
    } catch (err) {
      next(err);
    }
  }
};
