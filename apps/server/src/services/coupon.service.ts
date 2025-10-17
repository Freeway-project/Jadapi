import { Coupon, CouponDoc } from "../models/Coupon";
import { DeliveryOrder } from "../models/DeliveryOrder";
import { ApiError } from "../utils/ApiError";
import { Types } from "mongoose";

export class CouponService {
  /**
   * Validate a coupon for a specific user and order amount
   */
  static async validateCoupon(
    code: string,
    userId: Types.ObjectId,
    orderAmount: number,
    accountType?: "individual" | "business"
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

    // Check total usage limit
    if (coupon.maxUsesTotal && coupon.currentUsesTotal >= coupon.maxUsesTotal) {
      return { valid: false, message: "This coupon has reached its usage limit" };
    }

    // Check per-user usage limit
    if (coupon.maxUsesPerUser) {
      const userUsageCount = await DeliveryOrder.countDocuments({
        userId,
        "coupon.couponId": coupon._id
      });

      if (userUsageCount >= coupon.maxUsesPerUser) {
        return { valid: false, message: "You have already used this coupon the maximum number of times" };
      }
    }

    // Check user restrictions
    if (coupon.applicableToUserIds && coupon.applicableToUserIds.length > 0) {
      const isApplicable = coupon.applicableToUserIds.some(id => id.equals(userId));
      if (!isApplicable) {
        return { valid: false, message: "This coupon is not applicable to your account" };
      }
    }

    // Check account type restrictions
    if (accountType && coupon.applicableToAccountTypes && coupon.applicableToAccountTypes.length > 0) {
      if (!coupon.applicableToAccountTypes.includes(accountType)) {
        return { valid: false, message: `This coupon is only for ${coupon.applicableToAccountTypes.join(" and ")} accounts` };
      }
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
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
   * Apply coupon to order (increment usage count)
   */
  static async applyCoupon(couponId: Types.ObjectId): Promise<void> {
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
