import { Request, Response, NextFunction } from "express";
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
 * NOTE: Must be used after requireAuth middleware
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requireAuth already sets req.user to the User document
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!req.user.roles?.includes("admin")) {
      throw new ApiError(403, "Admin access required");
    }

    if (req.user.status !== "active") {
      throw new ApiError(403, "Account is not active");
    }

    next();
  } catch (error) {
    next(error);
  }
};
