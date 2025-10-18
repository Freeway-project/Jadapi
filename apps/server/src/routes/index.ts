import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import deliveryRoutes from "./delivery.routes";
import pricingRoutes from "./pricing.routes";
import adminRoutes from "./admin.routes";
import couponRoutes from "./coupon.routes";
import driverRoutes from "./driver.routes";
import { AppConfigService } from "../services/appConfig.service";
import { EarlyAccessRequest } from "../models/EarlyAccessRequest";
import { ApiError } from "../utils/ApiError";

const router = Router();

router.get("/", (_req, res) => res.json({status:200, ok: true }));

// Public endpoint to check app status
router.get("/status", async (_req, res, next) => {
  try {
    const isActive = await AppConfigService.isAppActive();
    res.json({
      success: true,
      data: {
        appActive: isActive,
        message: isActive ? 'Service is available' : 'Service is currently unavailable'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Public endpoint to submit early access request
router.post("/early-access", async (req, res, next) => {
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

    const request = await EarlyAccessRequest.create({
      pickupAddress,
      dropoffAddress,
      contactName,
      contactPhone,
      contactEmail,
      estimatedFare: estimatedFare ? {
        distance: estimatedFare?.distance,
        total: estimatedFare?.total,
        currency: estimatedFare?.currency || "CAD"
      } : undefined,
      notes,
      status: "pending",
      source: "web-app"
    });

    res.status(201).json({
      success: true,
      data: { requestId: request._id },
      message: "Thank you! We'll contact you as soon as service is available in your area."
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

export default router;
