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
 * Middleware to authenticate user from JWT token
 * Sets req.user if user is authenticated
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

    if (!user || user.status !== "active") {
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require authentication
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }
    next();
  } catch (error) {
    next(error);
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
