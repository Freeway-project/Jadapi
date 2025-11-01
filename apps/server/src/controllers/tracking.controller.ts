import { Request, Response, NextFunction } from 'express';
import { DeliveryOrder } from '../models/DeliveryOrder';
import { User } from '../models/user.model';
import { DriverLocationService } from '../services/driverLocation.service';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const TrackingController = {
  /**
   * Get order tracking information (public endpoint - no auth required)
   * GET /api/track/:orderId
   */
  async trackOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      // Find order by orderId (not _id)
      const order = await DeliveryOrder.findOne({ orderId }).populate('driverId', 'name phone vehicle');

      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      // Get driver location if driver is assigned and order is active
      let driverLocation = null;
      if (
        order.driverId && 
        ['assigned', 'picked_up', 'in_transit'].includes(order.status)
      ) {
        try {
          const location = await DriverLocationService.getDriverLocation(order.driverId.toString());
          if (location) {
            driverLocation = {
              lat: location.lat,
              lng: location.lng,
              heading: location.heading,
              speed: location.speed,
              lastUpdated: new Date(location.ts).toISOString(),
            };
          }
        } catch (err) {
          // Driver location not available (not an error)
          logger.info(`Driver location not available for order ${orderId}`);
        }
      }

      // Format driver info if available
      let driverInfo = null;
      if (order.driverId) {
        const driver = order.driverId as any;
        driverInfo = {
          _id: driver._id,
          name: driver.name || 'Driver',
          phone: driver.phone,
          vehicle: driver.vehicle,
        };
      }

      res.json({
        success: true,
        data: {
          order: {
            _id: order._id,
            orderId: order.orderId,
            status: order.status,
            paymentStatus: order.paymentStatus,
            pickup: {
              address: order.pickup.address,
              coordinates: order.pickup.coordinates,
              contactName: order.pickup.contactName,
              contactPhone: order.pickup.contactPhone,
            },
            dropoff: {
              address: order.dropoff.address,
              coordinates: order.dropoff.coordinates,
              contactName: order.dropoff.contactName,
              contactPhone: order.dropoff.contactPhone,
            },
            package: {
              size: order.package.size,
              description: order.package.description,
            },
            distance: order.distance,
            timeline: order.timeline,
          },
          driver: driverInfo,
          driverLocation,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get driver location for an order (public endpoint)
   * GET /api/track/:orderId/driver-location
   */
  async getDriverLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      const order = await DeliveryOrder.findOne({ orderId });

      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      if (!order.driverId) {
        return res.json({
          success: true,
          data: null,
        });
      }

      // Get driver location
      const location = await DriverLocationService.getDriverLocation(order.driverId.toString());

      if (!location) {
        return res.json({
          success: true,
          data: null,
        });
      }

      res.json({
        success: true,
        data: {
          lat: location.lat,
          lng: location.lng,
          heading: location.heading,
          speed: location.speed,
          lastUpdated: new Date(location.ts).toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
