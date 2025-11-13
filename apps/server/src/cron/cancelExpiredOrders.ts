/**
 * Cron Job Script: Auto-cancel expired orders
 *
 * This script can be called periodically (e.g., every 5 minutes) to check
 * for pending orders that have exceeded their 30-minute expiry time
 * and automatically cancel them.
 *
 * Usage:
 * 1. Add to crontab: */5 * * * * /usr/bin/node /path/to/cancelExpiredOrders.js
 * 2. Call via HTTP endpoint: POST /api/delivery/admin/cancel-expired-orders
 * 3. Use a scheduler like node-cron in the main app
 */

import { OrderExpiryService } from "../services/orderExpiry.service";
import { logger } from "../utils/logger";
import mongoose from "mongoose";

async function runCancelExpiredOrders() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error("MongoDB URI not configured");
      }
      await mongoose.connect(mongoUri);
      logger.info("Connected to MongoDB for cron job");
    }

    logger.info("Starting auto-cancel expired orders cron job");

    const cancelledCount = await OrderExpiryService.cancelExpiredOrders();

    logger.info({ cancelledCount }, "Completed auto-cancel expired orders cron job");

    // Optional: Get orders expiring soon for alerts
    const expiringSoon = await OrderExpiryService.getOrdersExpiringSoon(5);
    if (expiringSoon.length > 0) {
      logger.warn(
        { count: expiringSoon.length, orderIds: expiringSoon.map(o => o.orderId) },
        "Orders expiring within 5 minutes"
      );
      // TODO: Send notifications/alerts for orders expiring soon
    }

    return cancelledCount;
  } catch (error) {
    logger.error({ error }, "Failed to run cancel expired orders cron job");
    throw error;
  }
}

// If running as standalone script (not imported)
if (require.main === module) {
  runCancelExpiredOrders()
    .then(count => {
      console.log(`✅ Successfully cancelled ${count} expired order(s)`);
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

export { runCancelExpiredOrders };
