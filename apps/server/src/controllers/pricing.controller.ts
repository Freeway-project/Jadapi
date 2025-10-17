import { Request, Response, NextFunction } from 'express';
import { FareService } from '../services/fare.service';
import { DistanceService } from '../services/distance.service';
import { ConfigService } from '../services/config.service';
import { ApiError } from '../utils/ApiError';

/**
 * Pricing controller for fare estimates and distance calculations
 */
export class PricingController {

  /**
   * POST /api/pricing/estimate
   * Get fare estimate for a delivery
   */
  static async getFareEstimate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { pickup, dropoff, packageSize } = req.body;

      // Validate required fields
      if (!pickup || !pickup.lat || !pickup.lng) {
        throw new ApiError(400, 'Pickup location with lat/lng is required');
      }

      if (!dropoff || !dropoff.lat || !dropoff.lng) {
        throw new ApiError(400, 'Dropoff location with lat/lng is required');
      }

      // Calculate fare estimate
      const estimate = await FareService.estimateFare({
        pickup: { lat: pickup.lat, lng: pickup.lng },
        dropoff: { lat: dropoff.lat, lng: dropoff.lng },
        packageSize: packageSize || 'S'
      });

      res.status(200).json({
        success: true,
        data: {
          fare: estimate.fare,
          distance: estimate.distance
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/pricing/fare-range
   * Get fare range (min to max) for different package sizes
   */
  static async getFareRange(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { pickup, dropoff } = req.body;

      if (!pickup || !pickup.lat || !pickup.lng) {
        throw new ApiError(400, 'Pickup location with lat/lng is required');
      }

      if (!dropoff || !dropoff.lat || !dropoff.lng) {
        throw new ApiError(400, 'Dropoff location with lat/lng is required');
      }

      const fareRange = await FareService.estimateFareRange(
        { lat: pickup.lat, lng: pickup.lng },
        { lat: dropoff.lat, lng: dropoff.lng }
      );

      res.status(200).json({
        success: true,
        data: fareRange
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/pricing/distance
   * Calculate distance between two points
   */
  static async calculateDistance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { pickup, dropoff } = req.body;

      if (!pickup || !pickup.lat || !pickup.lng) {
        throw new ApiError(400, 'Pickup location with lat/lng is required');
      }

      if (!dropoff || !dropoff.lat || !dropoff.lng) {
        throw new ApiError(400, 'Dropoff location with lat/lng is required');
      }

      const distance = await DistanceService.calculate(
        { lat: pickup.lat, lng: pickup.lng },
        { lat: dropoff.lat, lng: dropoff.lng }
      );

      res.status(200).json({
        success: true,
        data: distance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pricing/config
   * Get current pricing configuration
   */
  static async getPricingConfig(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const config = await ConfigService.getActiveConfig();

      res.status(200).json({
        success: true,
        data: {
          rateCard: config.payload.rateCard,
          bands: config.payload.bands,
          serviceArea: config.payload.serviceArea,
          tax: config.payload.tax,
          version: config.version
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pricing/service-areas
   * Get service area coverage information
   */
  static async getServiceAreas(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const serviceArea = await ConfigService.getServiceArea();

      res.status(200).json({
        success: true,
        data: {
          centers: serviceArea.centers
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/pricing/validate-location
   * Check if a location is within service area
   */
  static async validateLocation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { lat, lng } = req.body;

      if (!lat || !lng) {
        throw new ApiError(400, 'Latitude and longitude are required');
      }

      const serviceArea = await ConfigService.getServiceArea();
      const validation = DistanceService.isWithinServiceArea(
        { lat, lng },
        serviceArea.centers
      );

      let nearestCenter = null;
      if (validation.nearestIndex >= 0) {
        nearestCenter = serviceArea.centers[validation.nearestIndex];
      }

      res.status(200).json({
        success: true,
        data: {
          isWithinServiceArea: validation.isWithin,
          nearestCenter,
          distanceToNearestCenter: validation.nearestDistance
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/pricing/rate-card
   * Get current rate card
   */
  static async getRateCard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rateCard = await ConfigService.getRateCard();

      res.status(200).json({
        success: true,
        data: {
          currency: rateCard.currency,
          baseFare: rateCard.base_cents / 100,
          perKm: rateCard.per_km_cents / 100,
          perMinute: rateCard.per_min_cents / 100,
          minFare: rateCard.min_fare_cents / 100,
          sizeMultipliers: rateCard.size_multiplier
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
