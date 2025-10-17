import { Schema, model, Document, Types } from "mongoose";

export interface CouponDoc extends Document<Types.ObjectId> {
  code: string;
  discountType: "eliminate_fee" | "fixed_discount" | "percentage_discount";
  discountValue?: number; // Amount in cents for fixed_discount, percentage for percentage_discount
  expiryDate?: Date;
  isActive: boolean;

  // Usage limits
  maxUsesTotal?: number; // Total times this coupon can be used
  maxUsesPerUser?: number; // Max times a single user can use this coupon
  currentUsesTotal: number;

  // User restrictions
  applicableToUserIds?: Types.ObjectId[]; // If set, only these users can use it
  applicableToAccountTypes?: ("individual" | "business")[]; // If set, only these account types

  // Order restrictions
  minOrderAmount?: number; // Minimum order amount in cents to apply coupon

  // Metadata
  description?: string;
  createdBy?: Types.ObjectId; // Admin who created it
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<CouponDoc>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    discountType: {
      type: String,
      enum: ["eliminate_fee", "fixed_discount", "percentage_discount"],
      required: true
    },
    discountValue: {
      type: Number,
      min: 0
    },
    expiryDate: {
      type: Date,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    // Usage limits
    maxUsesTotal: {
      type: Number,
      min: 0
    },
    maxUsesPerUser: {
      type: Number,
      min: 0,
      default: 1
    },
    currentUsesTotal: {
      type: Number,
      default: 0,
      min: 0
    },

    // User restrictions
    applicableToUserIds: [{
      type: Schema.Types.ObjectId,
      ref: "User"
    }],
    applicableToAccountTypes: [{
      type: String,
      enum: ["individual", "business"]
    }],

    // Order restrictions
    minOrderAmount: {
      type: Number,
      min: 0
    },

    // Metadata
    description: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Indexes for common queries
CouponSchema.index({ code: 1, isActive: 1 });
CouponSchema.index({ expiryDate: 1, isActive: 1 });

export const Coupon = model<CouponDoc>("Coupon", CouponSchema);
