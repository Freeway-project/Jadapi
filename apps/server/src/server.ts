import express from "express";
import cors from "cors";
import cron from "node-cron";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { authenticate } from "./middlewares/auth";
import webhookRoutes from "./routes/webhook.routes";
import fcmRoutes from "./routes/fcmRoutes";
import { runCancelExpiredOrders } from "./cron/cancelExpiredOrders";
import { runOtpCleanup } from "./cron/cleanupExpiredOtps";

const app = express();

// Middleware setup - relaxed CORS for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// IMPORTANT: Webhook routes MUST come BEFORE express.json()
// to receive raw body for signature verification
app.use("/api/webhooks", webhookRoutes);

// JSON body parser for all other routes (5MB limit for photo uploads)
app.use(express.json({ limit: '5mb' }));

app.use(fcmRoutes);

// Health check endpoint (no auth required)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// JWT authentication middleware
app.use(authenticate);

// Routes setup
app.use("/api", routes);
app.use(errorHandler);

// Start server
(async () => {
  try {
    await connectDB();

    // Start Express server
    app.listen(ENV.PORT, () => {
      logger.info(`Server running on http://localhost:${ENV.PORT}`);
    });

    // Set up cron job to cancel expired orders every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      logger.info("Running scheduled job: Cancel expired orders");
      try {
        await runCancelExpiredOrders();
      } catch (error) {
        logger.error({ error }, "Cron job failed: Cancel expired orders");
      }
    });

    // Set up cron job to cleanup expired OTPs every hour
    cron.schedule("0 * * * *", async () => {
      logger.info("Running scheduled job: Cleanup expired OTPs");
      try {
        await runOtpCleanup();
      } catch (error) {
        logger.error({ error }, "Cron job failed: Cleanup expired OTPs");
      }
    });

    logger.info("Cron job scheduled: Cancel expired orders (runs every 5 minutes)");
    logger.info("Cron job scheduled: Cleanup expired OTPs (runs every hour)");
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();

export default app;