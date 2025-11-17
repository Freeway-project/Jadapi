import { Schema, model, Document, Types } from "mongoose";

export interface OtpDoc extends Document<Types.ObjectId> {
  email?: string;
  phoneNumber?: string;
  identifier: string; // Combined identifier for easier querying
  code: string;
  type: "signup" | "login" | "password_reset";
  deliveryMethod: "email" | "sms" | "both";
  expiresAt: Date;
  verified: boolean;
  invalidated: boolean; // True when OTP is superseded by a newer OTP
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<OtpDoc>(
  {
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true,
    },
    identifier: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    type: {
      type: String,
      enum: ["signup", "login", "password_reset"],
      required: true,
      default: "signup",
    },
    deliveryMethod: {
      type: String,
      enum: ["email", "sms", "both"],
      required: true,
      default: "email",
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
    verified: {
      type: Boolean,
      default: false,
    },
    invalidated: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
OtpSchema.index({ identifier: 1, type: 1, verified: 1, invalidated: 1 });

// Pre-save middleware to handle code generation
OtpSchema.pre("save", function (next) {
  if (this.isNew && !this.code) {
    this.code = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

export const Otp = model<OtpDoc>("Otp", OtpSchema);