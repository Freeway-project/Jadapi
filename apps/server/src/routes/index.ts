import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import deliveryRoutes from "./delivery.routes";
import pricingRoutes from "./pricing.routes";
import adminRoutes from "./admin.routes";
import couponRoutes from "./coupon.routes";
import driverRoutes from "./driver.routes";
import paymentRoutes from "./payment.routes";
import webhookRoutes from "./webhook.routes";
import earlyAccessRoutes from "./earlyAccess.routes";
import { AppConfigService } from "../services/appConfig.service";
import { SystemStatsService } from "../services/systemStats.service";

const router = Router();

router.get("/", async (_req, res) => {
  const stats = SystemStatsService.getStats();
  const isActive = await AppConfigService.isAppActive();
  
  res.json({
    status: 200,
    ok: true,
    systemStats: stats,
    serviceStatus: {
      active: isActive,
      message: isActive ? 'Service is available' : 'Service is currently unavailable'
    }
  });
});

// Public endpoint to check app status
router.get("/status", async (_req, res, next) => {
  try {
    const isActive = await AppConfigService.isAppActive();
    const stats = SystemStatsService.getStats();
    
    res.json({
      success: true,
      data: {
        appActive: isActive,
        message: isActive ? 'Service is available' : 'Service is currently unavailable',
        systemStats: stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Auth routes
router.use("/auth", authRoutes);

// User routes
router.use("/users", userRoutes);

// Delivery routes
router.use("/delivery", deliveryRoutes);

// Pricing routes
router.use("/pricing", pricingRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// Coupon routes
router.use("/coupons", couponRoutes);

// Driver routes
router.use("/driver", driverRoutes);

// Payment routes
router.use("/payment", paymentRoutes);

// Webhook routes
router.use("/webhooks", webhookRoutes);

// Early Access routes
router.use("/early-access", earlyAccessRoutes);

export default router;
