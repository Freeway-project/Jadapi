import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware to check if authenticated user has driver role
 * NOTE: Must be used after requireAuth middleware
 */
export async function driverAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    // requireAuth already sets req.user to the User document
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!req.user.roles?.includes("driver")) {
      throw new ApiError(403, "Driver access required");
    }

    if (req.user.status !== "active") {
      throw new ApiError(403, "Driver account is not active");
    }

    next();
  } catch (error) {
    next(error);
  }
}
