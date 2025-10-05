import { Schema, model, Document, Types } from "mongoose";
import { E164_REGEX } from "./common";
import * as crypto from "crypto"; // for randomUUID()

type AccountType = "individual" | "business";
type Role = "customer" | "business" | "driver" | "dispatcher" | "admin" | "super_admin";

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
    displayName: string;              // Individual name or Business display name
    legalName?: string | null;        // For businesses
    defaultAddressId?: Types.ObjectId | null;
  };

  addressBook: Types.ObjectId[];      // -> Address._id

  businessProfile?: {
    gstNumber?: string | null;
    billingEmail?: string | null;
    billingAddressId?: Types.ObjectId | null;
  };

  delegation?: {
    canSendOnBehalfOf: { userId: Types.ObjectId; grantedAt: Date }[];
    authorizedSenders: { userId: Types.ObjectId; grantedAt: Date }[];
    apiKeys: { keyId: string; hash: string; label?: string; createdAt: Date; revokedAt?: Date | null }[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const DelegationEntry = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    grantedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ApiKeyEntry = new Schema(
  {
    keyId: { type: String, required: true },
    hash: { type: String, required: true },  // store only hash of API key
    label: { type: String },
    createdAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { _id: false }
);

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
      enum: ["customer", "business", "driver", "dispatcher", "admin", "super_admin"],
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
      displayName: { type: String, required: true, trim: true },
      legalName: { type: String, default: null },
      defaultAddressId: { type: Schema.Types.ObjectId, ref: "Address", default: null },
    },

    addressBook: [{ type: Schema.Types.ObjectId, ref: "Address" }],

    businessProfile: {
      gstNumber: { type: String, default: null },
      billingEmail: { type: String, default: null, lowercase: true, trim: true },
      billingAddressId: { type: Schema.Types.ObjectId, ref: "Address", default: null },
    },

    delegation: {
      canSendOnBehalfOf: { type: [DelegationEntry], default: [] },
      authorizedSenders: { type: [DelegationEntry], default: [] },
      apiKeys: { type: [ApiKeyEntry], default: [] },
    },
  },
  { timestamps: true }
);

// Compound uniqueness on email/phone if present (sparse)
UserSchema.index({ "auth.email": 1 }, { unique: true, sparse: true });
UserSchema.index({ "auth.phone": 1 }, { unique: true, sparse: true });

// Ensure business fields when accountType=business
UserSchema.pre("validate", function (next: any) {
  const doc = this as any;
  if (doc.accountType === "business") {
    if (!doc.profile?.displayName) {
      return next(new Error("Business accounts require profile.displayName"));
    }
  }
  next();
});

export const User = model<UserDoc>("User", UserSchema);
