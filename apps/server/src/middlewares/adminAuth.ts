import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.roles?.includes("admin")) {
      throw new ApiError(403, "Admin access required");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Account is not active");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
