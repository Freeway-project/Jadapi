import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Combined middleware to authenticate and require authentication
 * This is the main middleware to use for protected routes
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required - No token provided");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = jwtUtils.verifyToken(token);

    if (!payload) {
      throw new ApiError(401, "Invalid token");
    }

    // Get user from database
    const user = await User.findById(payload.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (user.status !== "active") {
      throw new ApiError(401, "Account is not active");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional middleware to authenticate user without requiring it
 * Sets req.user if user is authenticated, but continues if not
 * Use this for routes that work with or without authentication
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = jwtUtils.verifyToken(token);

    if (!payload) {
      return next();
    }

    // Get user from database
    const user = await User.findById(payload.userId);

    if (user && user.status === "active") {
      req.user = user;
    }

    next();
  } catch (error) {
    // Don't fail on auth errors for optional auth
    next();
  }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!req.user.roles?.includes("admin")) {
      throw new ApiError(403, "Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};
