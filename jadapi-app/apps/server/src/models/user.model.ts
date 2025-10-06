import { Schema, model, Document, Types } from "mongoose";
import { E164_REGEX } from "./common";
import * as crypto from "crypto"; // for randomUUID()

type AccountType = "individual" | "business";
type Role = "customer" | "business" | "driver" | "admin";

export interface UserDoc extends Document<Types.ObjectId> {
  uuid: string;                       // public stable ID for verification/lookup
  accountType: AccountType;
  roles: Role[];
  status: "active" | "suspended" | "deleted";

  auth: {
    email?: string;
    phone?: string;
    password?: string;
    emailVerifiedAt?: Date | null;
    phoneVerifiedAt?: Date | null;
    lastLoginAt?: Date | null;
  };

  profile: {
    name?: string | null;             // User's name (individual or business)
    address?: string | null;          // Primary address
  };

  businessProfile?: {
    gstNumber?: string | null;
    businessName?: string | null;     // Legal business name
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(), // swap with uuidv7() if you install `uuidv7`
    },
    accountType: { type: String, enum: ["individual", "business"], required: true, index: true },
    roles: {
      type: [String],
      enum: ["customer", "business", "driver", "admin"],
      default: ["customer"],
      index: true,
    },
    status: { type: String, enum: ["active", "suspended", "deleted"], default: "active" },

    auth: {
      email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true,
      },
      phone: {
        type: String,
        index: true,
        sparse: true,
        validate: {
          validator: (v: string) => !v || E164_REGEX.test(v),
          message: "phone must be E.164 like +16045551234",
        },
      },
      password: {
        type: String,
        select: false, // Don't include password in queries by default
      },
      emailVerifiedAt: { type: Date, default: null },
      phoneVerifiedAt: { type: Date, default: null },
      lastLoginAt: { type: Date, default: null },
    },

    profile: {
      name: { type: String, default: null, trim: true },
      address: { type: String, default: null, trim: true },
    },

    businessProfile: {
      gstNumber: { type: String, default: null },
      businessName: { type: String, default: null, trim: true },
    },
  },
  { timestamps: true }
);

// Compound uniqueness on email/phone if present (sparse)
UserSchema.index({ "auth.email": 1 }, { unique: true, sparse: true });
UserSchema.index({ "auth.phone": 1 }, { unique: true, sparse: true });

// Note: Profile fields are optional and can be completed after signup

export const User = model<UserDoc>("User", UserSchema);
