import { Request, Response, NextFunction } from 'express';
import { AppConfigService } from '../services/appConfig.service';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware to check if the app is active
 * If app is inactive, returns 503 Service Unavailable
 */
export const checkAppActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isActive = await AppConfigService.isAppActive();

    if (!isActive) {
      throw new ApiError(
        503,
        'Service is currently unavailable. Please try again later.'
      );
    }

    next();
  } catch (error) {
    // If error is already ApiError, pass it along
    if (error instanceof ApiError) {
      next(error);
    } else {
      // For other errors, log and allow request to proceed (fail open)
      console.error('Error checking app active status:', error);
      next();
    }
  }
};
