import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { jwtUtils } from "../utils/jwt";
import bcrypt from "bcrypt";

export const AuthController = {
  /**
   * Create super admin - for initial setup only
   * POST /api/auth/create-super-admin
   */
  async createSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, displayName } = req.body;

      if (!email || !password || !displayName) {
        throw new ApiError(400, "Email, password, and display name are required");
      }

      // Check if email already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw new ApiError(409, "Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create super admin user
      const user = await UserRepository.create({
        accountType: "individual",
        email,
        phone: undefined,
        password: hashedPassword,
        displayName,
        roles: ["super_admin"],
        status: "active",
      });

      // Generate JWT token
      const token = jwtUtils.generateToken({
        userId: user._id.toString(),
        email: user.auth.email,
        roles: user.roles,
      });

      res.status(201).json({
        message: "Super admin created successfully",
        token,
        user: {
          uuid: user.uuid,
          email: user.auth.email,
          displayName: user.profile.displayName,
          roles: user.roles,
          status: user.status,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
      }

      // Find user by email (need to select password explicitly since it's excluded by default)
      const user = await UserRepository.findByEmailWithPassword(email);
      if (!user) {
        throw new ApiError(401, "Invalid email or password");
      }

      // Check if user has password set
      if (!user.auth.password) {
        throw new ApiError(401, "Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.auth.password);
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
      }

      // Check if user is active
      if (user.status !== "active") {
        throw new ApiError(403, "Account is not active");
      }

      // Generate JWT token
      const token = jwtUtils.generateToken({
        userId: user._id.toString(),
        email: user.auth.email,
        roles: user.roles,
      });

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          uuid: user.uuid,
          email: user.auth.email,
          displayName: user.profile.displayName,
          roles: user.roles,
          status: user.status,
          accountType: user.accountType,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
