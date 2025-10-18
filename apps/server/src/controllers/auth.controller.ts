import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { jwtUtils } from "../utils/jwt";
import bcrypt from "bcrypt";

export const AuthController = {
  /**
   * Create admin - for initial setup only
   * POST /api/auth/create-admin
   */
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        throw new ApiError(400, "Email, password, and name are required");
      }

      // Check if email already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw new ApiError(409, "Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const user = await UserRepository.create({
        accountType: "individual",
        email,
        phone: undefined,
        password: hashedPassword,
        name,
        roles: ["admin"],
        status: "active",
      });

      // Generate JWT token
      const token = jwtUtils.generateToken({
        userId: user._id.toString(),
        email: user.auth.email,
        roles: user.roles,
      });

      res.status(201).json({
        message: "Admin created successfully",
        token,
        user: {
          uuid: user.uuid,
          email: user.auth.email,
          name: user.profile.name,
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
          name: user.profile?.name,
          address: user.profile?.address,
          roles: user.roles,
          status: user.status,
          accountType: user.accountType,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create driver account
   * POST /api/auth/create-driver
   */
  async createDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, phone, name, address } = req.body;

      if (!email || !password || !name || !phone || !address) {
        throw new ApiError(400, "Email, password, name, phone, and address are required");
      }

      // Check if email already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw new ApiError(409, "Email already exists");
      }

      // Check if phone already exists
      if (phone) {
        const existingPhone = await UserRepository.findByPhone(phone);
        if (existingPhone) {
          throw new ApiError(409, "Phone number already exists");
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create driver user
      const user = await UserRepository.create({
        accountType: "individual",
        email,
        phone,
        password: hashedPassword,
        name,
        address,
        roles: ["driver"],
        status: "active",
      });

      // Generate JWT token
      const token = jwtUtils.generateToken({
        userId: user._id.toString(),
        email: user.auth.email,
        roles: user.roles,
      });

      res.status(201).json({
        success: true,
        message: "Driver account created successfully",
        token,
        user: {
          uuid: user.uuid,
          email: user.auth.email,
          phone: user.auth.phone,
          name: user.profile.name,
          address: user.profile.address,
          roles: user.roles,
          status: user.status,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
