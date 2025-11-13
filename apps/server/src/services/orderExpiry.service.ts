import { DeliveryOrder } from "../models/DeliveryOrder";
import { logger } from "../utils/logger";

export class OrderExpiryService {
  /**
   * Auto-cancel pending orders that have expired (30 minutes past creation without driver assignment)
   * @returns Number of orders auto-cancelled
   */
  static async cancelExpiredOrders(): Promise<number> {
    try {
      const now = new Date();

      // Find all pending orders where expiresAt has passed
      const expiredOrders = await DeliveryOrder.find({
        status: "pending",
        expiresAt: { $lte: now },
        driverId: { $exists: false } // No driver assigned
      });

      if (expiredOrders.length === 0) {
        logger.info("No expired orders found");
        return 0;
      }

      logger.info({ count: expiredOrders.length }, "Found expired orders to cancel");

      // Update all expired orders to cancelled
      const result = await DeliveryOrder.updateMany(
        {
          status: "pending",
          expiresAt: { $lte: now },
          driverId: { $exists: false }
        },
        {
          $set: {
            status: "cancelled",
            "timeline.cancelledAt": now
          }
        }
      );

      logger.info(
        { cancelledCount: result.modifiedCount },
        "Auto-cancelled expired orders"
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error({ error }, "Failed to cancel expired orders");
      throw error;
    }
  }

  /**
   * Get orders that will expire soon (within next 5 minutes)
   * Useful for notifications/alerts
   */
  static async getOrdersExpiringSoon(minutesThreshold: number = 5): Promise<any[]> {
    try {
      const now = new Date();
      const thresholdTime = new Date(now.getTime() + minutesThreshold * 60 * 1000);

      const expiringSoonOrders = await DeliveryOrder.find({
        status: "pending",
        expiresAt: { $gte: now, $lte: thresholdTime },
        driverId: { $exists: false }
      })
        .populate("userId", "auth.email auth.phone profile.name")
        .select("orderId userId expiresAt pickup.address dropoff.address createdAt");

      return expiringSoonOrders;
    } catch (error) {
      logger.error({ error }, "Failed to fetch orders expiring soon");
      throw error;
    }
  }

  /**
   * Clear expiresAt for an order when it's assigned to a driver
   * This prevents auto-cancellation
   */
  static async clearExpiryOnAssignment(orderId: string): Promise<void> {
    try {
      await DeliveryOrder.updateOne(
        { orderId },
        { $unset: { expiresAt: "" } }
      );

      logger.info({ orderId }, "Cleared expiry time after driver assignment");
    } catch (error) {
      logger.error({ error, orderId }, "Failed to clear expiry time");
      throw error;
    }
  }
}
