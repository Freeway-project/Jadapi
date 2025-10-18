import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";

/**
 * Middleware to check if authenticated user has driver role
 */
export async function driverAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new ApiError(401, "Authentication required");
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.roles.includes("driver")) {
      throw new ApiError(403, "Driver access required");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Driver account is not active");
    }

    next();
  } catch (error) {
    next(error);
  }
}
