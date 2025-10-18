import { Request, Response, NextFunction } from "express";
import { EarlyAccessService } from "../services/earlyAccess.service";
import { ApiError } from "../utils/ApiError";

export class EarlyAccessController {
  static async submitRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { pickupAddress, dropoffAddress, contactName, contactPhone, contactEmail, estimatedFare, notes } = req.body;

      // Validate required fields
      if (!pickupAddress || !dropoffAddress || !contactName || !contactPhone) {
        throw new ApiError(400, "Pickup address, dropoff address, contact name, and phone are required");
      }

      // Validate phone format (basic)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(contactPhone)) {
        throw new ApiError(400, "Invalid phone number format");
      }

      const request = await EarlyAccessService.createRequest({
        pickupAddress,
        dropoffAddress,
        contactName,
        contactPhone,
        contactEmail,
        estimatedFare,
        notes
      });

      res.status(201).json({
        success: true,
        data: { requestId: request._id },
        message: "Thank you! We'll contact you as soon as service is available in your area."
      });
    } catch (error) {
      next(error);
    }
  }
}