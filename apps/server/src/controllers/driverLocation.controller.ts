import { Request, Response, NextFunction } from "express";
import { DriverLocationService } from "../services/driverLocation.service";

export class DriverLocationController {
  /**
   * Update driver location (no auth required for real-time tracking)
   * POST /api/driver/location
   */
  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId, lat, lng, heading, speed } = req.body;

      const location = await DriverLocationService.updateLocation({
        driverId,
        lat,
        lng,
        heading,
        speed,
      });

      res.json({
        success: true,
        data: location,
        message: "Location updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all active drivers with optional filters
   * GET /api/driver/locations
   */
  static async getActiveDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const { north, south, east, west, limit } = req.query;

      const filters: any = {};

      // Parse geographic bounds if provided
      if (north && south && east && west) {
        filters.bounds = {
          north: parseFloat(north as string),
          south: parseFloat(south as string),
          east: parseFloat(east as string),
          west: parseFloat(west as string),
        };
      }

      // Parse limit
      if (limit) {
        filters.limit = parseInt(limit as string);
      }

      const [locations, total] = await Promise.all([
        DriverLocationService.getActiveDrivers(filters),
        DriverLocationService.getActiveCount(),
      ]);

      res.json({
        success: true,
        data: {
          drivers: locations,
          count: locations.length,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single driver location
   * GET /api/driver/location/:driverId
   */
  static async getDriverLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;

      const location = await DriverLocationService.getDriverLocation(driverId);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Driver not found or offline",
        });
      }

      res.json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove driver from active list (going offline)
   * DELETE /api/driver/location/:driverId
   */
  static async removeDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId } = req.params;

      const removed = await DriverLocationService.removeDriver(driverId);

      res.json({
        success: true,
        data: { removed },
        message: removed ? "Driver removed successfully" : "Driver not found",
      });
    } catch (error) {
      next(error);
    }
  }
}
