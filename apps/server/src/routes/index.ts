import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import deliveryRoutes from "./delivery.routes";
import pricingRoutes from "./pricing.routes";
import adminRoutes from "./admin.routes";
import couponRoutes from "./coupon.routes";
import driverRoutes from "./driver.routes";
import paymentRoutes from "./payment.routes";
import smsRoutes from "./sms.routes";
import trackingRoutes from "./tracking.routes";
import testRoutes from "./test.routes";
import { AppConfigService } from "../services/appConfig.service";
import { EarlyAccessRequest } from "../models/EarlyAccessRequest";
import { ApiError } from "../utils/ApiError";
import { EmailService } from "../services/email.service";
import { ENV } from "../config/env";
import { logger } from "../utils/logger";

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

    // Send email notification to admin if configured
    if (ENV.ADMIN_NOTIFICATION_EMAIL) {
      try {
        const fareInfo = estimatedFare
          ? `\n  Distance: ${estimatedFare.distance?.toFixed(2)} km\n  Estimated Fare: ${estimatedFare.currency || 'CAD'} $${estimatedFare.total?.toFixed(2)}`
          : '';

        await EmailService.sendEmail({
          to: ENV.ADMIN_NOTIFICATION_EMAIL,
          subject: `New Early Access Request - ${contactName}`,
          text: `New early access request received:

Name: ${contactName}
Phone: ${contactPhone}
Email: ${contactEmail || 'Not provided'}

Pickup: ${pickupAddress}
Dropoff: ${dropoffAddress}${fareInfo}

Notes: ${notes || 'None'}

Request ID: ${request._id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Early Access Request</h2>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Contact Information</h3>
                <p><strong>Name:</strong> ${contactName}</p>
                <p><strong>Phone:</strong> ${contactPhone}</p>
                <p><strong>Email:</strong> ${contactEmail || 'Not provided'}</p>
              </div>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Route Details</h3>
                <p><strong>Pickup:</strong> ${pickupAddress}</p>
                <p><strong>Dropoff:</strong> ${dropoffAddress}</p>
                ${estimatedFare ? `
                  <p><strong>Distance:</strong> ${estimatedFare.distance?.toFixed(2)} km</p>
                  <p><strong>Estimated Fare:</strong> ${estimatedFare.currency || 'CAD'} $${estimatedFare.total?.toFixed(2)}</p>
                ` : ''}
              </div>

              ${notes ? `
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Additional Notes</h3>
                  <p>${notes}</p>
                </div>
              ` : ''}

              <p style="color: #6b7280; font-size: 12px;">Request ID: ${request._id}</p>
            </div>
          `
        });
      } catch (emailError) {
        // Log error but don't fail the request
        logger.error({ error: emailError }, 'Failed to send admin notification email');
      }
    }

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

// Payment routes
router.use("/payment", paymentRoutes);

// SMS routes (admin)
router.use("/sms", smsRoutes);

// Tracking routes (public - no auth required)
router.use("/track", trackingRoutes);

// Test routes (TEMPORARY - for development only)
router.use("/test", testRoutes);

export default router;
