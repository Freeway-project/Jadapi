import { Router, Request, Response } from "express";
import { SmsRateLimitService } from "../services/smsRateLimit.service";
import { authenticate } from "../middlewares/auth";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/sms/usage
 * Get current SMS usage statistics (Admin only)
 */
router.get("/usage", authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Check if user is admin (you may need to adjust this based on your auth system)
    if (user.role !== "admin") {
      throw new ApiError(403, "Unauthorized: Admin access required");
    }

    const stats = await SmsRateLimitService.getUsageStats();

    // Calculate usage percentages
    const usagePercentages = {
      hourly: (stats.hourly / stats.limits.global.hourly) * 100,
      daily: (stats.daily / stats.limits.global.daily) * 100,
      monthly: (stats.monthly / stats.limits.global.monthly) * 100,
      costDaily: (stats.costDaily / stats.limits.costs.dailyLimit) * 100,
      costMonthly: (stats.costMonthly / stats.limits.costs.monthlyLimit) * 100,
    };

    // Warnings if approaching limits
    const warnings = [];
    if (usagePercentages.hourly > 80) warnings.push("Hourly limit approaching (>80%)");
    if (usagePercentages.daily > 80) warnings.push("Daily limit approaching (>80%)");
    if (usagePercentages.monthly > 80) warnings.push("Monthly limit approaching (>80%)");
    if (usagePercentages.costDaily > 80) warnings.push("Daily cost limit approaching (>80%)");
    if (usagePercentages.costMonthly > 80) warnings.push("Monthly cost limit approaching (>80%)");

    res.json({
      success: true,
      data: {
        usage: stats,
        percentages: usagePercentages,
        warnings,
        status: warnings.length > 0 ? "warning" : "healthy",
      },
    });
  } catch (error: any) {
    logger.error({ error }, "sms.routes - Get usage error");
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get SMS usage",
    });
  }
});

/**
 * GET /api/sms/check-rate-limit/:phone
 * Check if SMS can be sent to a specific phone number
 */
router.get("/check-rate-limit/:phone", authenticate, async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    const { type = "transactional" } = req.query;

    const check = await SmsRateLimitService.canSendSms(
      phone,
      type as any,
      undefined
    );

    res.json({
      success: true,
      data: {
        allowed: check.allowed,
        reason: check.reason,
        retryAfter: check.retryAfter,
      },
    });
  } catch (error: any) {
    logger.error({ error }, "sms.routes - Check rate limit error");
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to check rate limit",
    });
  }
});

export default router;
