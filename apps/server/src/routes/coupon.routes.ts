import { Router, Request, Response } from "express";
import { CouponService } from "../services/coupon.service";
import { ApiError } from "../utils/ApiError";
import { authenticate } from "../middlewares/auth";
import { Types } from "mongoose";

const router = Router();

/**
 * POST /api/coupons/validate
 * Validate a coupon code for the current user
 */
router.post("/validate", authenticate, async (req: Request, res: Response) => {
  try {
    const { code, orderAmount, accountType } = req.body;
    const user = (req as any).user;

    if (!user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!code) {
      throw new ApiError(400, "Coupon code is required");
    }

    if (!orderAmount || orderAmount <= 0) {
      throw new ApiError(400, "Valid order amount is required");
    }

    const validation = await CouponService.validateCoupon(
      code,
      user._id,
      orderAmount,
      accountType
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Calculate discount
    const discount = CouponService.calculateDiscount(
      validation.coupon!,
      orderAmount,
      req.body.baseFare || 0
    );

    res.json({
      success: true,
      data: {
        valid: true,
        coupon: {
          code: validation.coupon!.code,
          discountType: validation.coupon!.discountType,
          discountValue: validation.coupon!.discountValue,
          description: validation.coupon!.description
        },
        discount,
        newTotal: orderAmount - discount
      },
      message: "Coupon is valid"
    });
  } catch (error: any) {
    console.error("Validate coupon error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to validate coupon"
    });
  }
});

/**
 * POST /api/coupons/admin
 * Create a new coupon (Admin only)
 */
router.post("/admin", authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.roles?.includes("admin")) {
      throw new ApiError(403, "Admin access required");
    }

    const {
      code,
      discountType,
      discountValue,
      expiryDate,
      maxUsesTotal,
      maxUsesPerUser,
      applicableToUserIds,
      applicableToAccountTypes,
      minOrderAmount,
      description
    } = req.body;

    if (!code || !discountType) {
      throw new ApiError(400, "Code and discount type are required");
    }

    const coupon = await CouponService.createCoupon({
      code,
      discountType,
      discountValue,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      maxUsesTotal,
      maxUsesPerUser,
      applicableToUserIds: applicableToUserIds?.map((id: string) => new Types.ObjectId(id)),
      applicableToAccountTypes,
      minOrderAmount,
      description,
      createdBy: user._id
    });

    res.status(201).json({
      success: true,
      data: { coupon },
      message: "Coupon created successfully"
    });
  } catch (error: any) {
    console.error("Create coupon error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create coupon"
    });
  }
});

/**
 * GET /api/coupons/admin
 * Get all coupons (Admin only)
 */
router.get("/admin", authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.roles?.includes("admin")) {
      throw new ApiError(403, "Admin access required");
    }

    const { isActive, discountType } = req.query;
    const filters: any = {};

    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (discountType) filters.discountType = discountType;

    const coupons = await CouponService.getAllCoupons(filters);

    res.json({
      success: true,
      data: { coupons, count: coupons.length }
    });
  } catch (error: any) {
    console.error("Get coupons error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch coupons"
    });
  }
});

/**
 * PUT /api/coupons/admin/:id
 * Update coupon (Admin only)
 */
router.put("/admin/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.roles?.includes("admin")) {
      throw new ApiError(403, "Admin access required");
    }

    const { id } = req.params;
    const updates = req.body;

    const coupon = await CouponService.updateCoupon(id, updates);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found");
    }

    res.json({
      success: true,
      data: { coupon },
      message: "Coupon updated successfully"
    });
  } catch (error: any) {
    console.error("Update coupon error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update coupon"
    });
  }
});

/**
 * PUT /api/coupons/admin/:id/toggle
 * Toggle coupon active status (Admin only)
 */
router.put("/admin/:id/toggle", authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user || !user.roles?.includes("admin")) {
      throw new ApiError(403, "Admin access required");
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await CouponService.toggleCoupon(id, isActive);

    if (!coupon) {
      throw new ApiError(404, "Coupon not found");
    }

    res.json({
      success: true,
      data: { coupon },
      message: `Coupon ${isActive ? "activated" : "deactivated"} successfully`
    });
  } catch (error: any) {
    console.error("Toggle coupon error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to toggle coupon"
    });
  }
});

export default router;
