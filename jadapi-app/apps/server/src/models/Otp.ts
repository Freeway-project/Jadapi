import { Schema, model, Document, Types } from "mongoose";

export interface OtpDoc extends Document<Types.ObjectId> {
  email: string;
  code: string;
  type: "signup" | "login" | "password_reset";
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<OtpDoc>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
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
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
OtpSchema.index({ email: 1, type: 1, verified: 1 });

// Pre-save middleware to handle code generation
OtpSchema.pre("save", function (next) {
  if (this.isNew && !this.code) {
    this.code = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

export const Otp = model<OtpDoc>("Otp", OtpSchema);