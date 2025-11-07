import { Request, Response, NextFunction } from "express";
import { DriverService } from "../services/driver.service";
import { sendDriverNotification } from "../services/notificationService";
import { Types } from "mongoose";

export class DriverController {
  /**
   * Get driver profile and dashboard data
   */
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user?._id;

      const [profile, stats, activeOrders] = await Promise.all([
        DriverService.getDriverProfile(driverId),
        DriverService.getDriverStats(driverId),
        DriverService.getDriverOrders(driverId, {
          status: "assigned,picked_up,in_transit",
          limit: 5,
        }),
      ]);

      res.json({
        success: true,
        data: {
          profile,
          stats,
          activeOrders: activeOrders.orders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available orders for drivers
   */
  static async getAvailableOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const result = await DriverService.getAvailableOrders({ limit, skip });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get driver's assigned orders
   */
  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user?._id;
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const result = await DriverService.getDriverOrders(driverId, {
        status,
        limit,
        skip,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept an available order
   */
  static async acceptOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const driverId = req.user?._id;

      const order = await DriverService.acceptOrder(orderId, driverId);

      res.json({
        success: true,
        data: { order },
        message: "Order accepted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const driverId = req.user?._id;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const validStatuses = ["picked_up", "in_transit", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const order = await DriverService.updateOrderStatus(
        orderId,
        driverId,
        status
      );

      res.json({
        success: true,
        data: { order },
        message: `Order marked as ${status.replace("_", " ")}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign a parcel to a driver and send notification
   */
  static async assignOrderToDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId, parcelId } = req.body;

      // In a real application, you would have logic here to:
      // 1. Validate driverId and parcelId
      // 2. Update the order in the database to assign it to the driver
      // 3. Potentially fetch order details for the notification

      console.log(`Simulating assignment of parcel ${parcelId} to driver ${driverId}`);

      await sendDriverNotification(driverId, {
        title: "New Delivery Request",
        body: `You have been assigned a new parcel: #${parcelId}. Tap to view details.`,
        url: `/driver/parcels/${parcelId}`,
        data: { parcelId: String(parcelId) },
      });

      res.json({
        success: true,
        message: "Parcel assigned and notification sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get driver statistics
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.user?._id;

      const stats = await DriverService.getDriverStats(driverId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
