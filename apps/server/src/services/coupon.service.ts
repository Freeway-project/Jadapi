import { Coupon, CouponDoc } from "../models/Coupon";
import { DeliveryOrder } from "../models/DeliveryOrder";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

export class CouponService {
  /**
   * Validate a coupon - Simple validation only
   * Checks: coupon exists, is active, not expired, meets minimum order amount
   */
  static async validateCoupon(
    code: string,
    orderAmount?: number
  ): Promise<{ valid: boolean; coupon?: CouponDoc; message?: string }> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    // Check if active
    if (!coupon.isActive) {
      return { valid: false, message: "This coupon is no longer active" };
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return { valid: false, message: "This coupon has expired" };
    }

    // Check minimum order amount (if provided)
    if (orderAmount && coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of $${(coupon.minOrderAmount / 100).toFixed(2)} required`
      };
    }

    return { valid: true, coupon };
  }

  /**
   * Calculate discount amount based on coupon
   */
  static calculateDiscount(
    coupon: CouponDoc,
    subtotal: number,
    baseFare: number
  ): number {
    switch (coupon.discountType) {
      case "eliminate_fee":
        // Eliminate platform/base fee
        return baseFare;

      case "fixed_discount":
        // Fixed amount discount (in cents)
        return Math.min(coupon.discountValue || 0, subtotal);

      case "percentage_discount":
        // Percentage discount
        const percentage = (coupon.discountValue || 0) / 100;
        return Math.floor(subtotal * percentage);

      default:
        return 0;
    }
  }

  /**
   * Track coupon usage for analytics (optional - for future use)
   * Currently just increments the usage counter without validation
   */
  static async recordCouponUsage(couponId: Types.ObjectId): Promise<void> {
    await Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { currentUsesTotal: 1 } }
    );
  }

  /**
   * Create a new coupon (admin only)
   */
  static async createCoupon(data: {
    code: string;
    discountType: "eliminate_fee" | "fixed_discount" | "percentage_discount";
    discountValue?: number;
    expiryDate?: Date;
    maxUsesTotal?: number;
    maxUsesPerUser?: number;
    applicableToUserIds?: Types.ObjectId[];
    applicableToAccountTypes?: ("individual" | "business")[];
    minOrderAmount?: number;
    description?: string;
    createdBy?: Types.ObjectId;
  }): Promise<CouponDoc> {
    const coupon = await Coupon.create({
      ...data,
      code: data.code.toUpperCase()
    });

    return coupon;
  }

  /**
   * Get all coupons (admin only)
   */
  static async getAllCoupons(filters?: {
    isActive?: boolean;
    discountType?: string;
  }): Promise<CouponDoc[]> {
    const query: any = {};
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;
    if (filters?.discountType) query.discountType = filters.discountType;

    return Coupon.find(query).sort({ createdAt: -1 });
  }

  /**
   * Update coupon (admin only)
   */
  static async updateCoupon(
    couponId: string,
    updates: Partial<CouponDoc>
  ): Promise<CouponDoc | null> {
    return Coupon.findByIdAndUpdate(couponId, updates, { new: true });
  }

  /**
   * Toggle coupon active status (admin only)
   */
  static async toggleCoupon(
    couponId: string,
    isActive: boolean
  ): Promise<CouponDoc | null> {
    return Coupon.findByIdAndUpdate(couponId, { isActive }, { new: true });
  }
}
