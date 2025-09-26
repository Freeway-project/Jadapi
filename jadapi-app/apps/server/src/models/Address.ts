import { Schema, model, Document, Types } from "mongoose";

export interface AddressDoc extends Document<Types.ObjectId> {
  ownerUserId: Types.ObjectId;
  label?: "Home" | "Office" | "Warehouse" | "Other";
  line1: string;
  line2?: string;
  city: string;             // Vancouver-focused now, keep general
  pincode: string;          // Postal code
  province: "BC";
  country: "CA";
  placeId?: string;         // Google Place ID
  lat?: number;
  lng?: number;
  verifiedAt?: Date | null; // present if geocode/places verified
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<AddressDoc>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    label: { type: String, enum: ["Home", "Office", "Warehouse", "Other"], default: "Other" },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    province: { type: String, required: true, default: "BC" },
    country: { type: String, required: true, default: "CA" },
    placeId: { type: String, trim: true },
    lat: Number,
    lng: Number,
    verifiedAt: { type: Date, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// If verifiedAt is set, require placeId + lat/lng
AddressSchema.pre("validate", function (next: any) {
  const doc = this as any;
  if (doc.verifiedAt) {
    if (!doc.placeId || typeof doc.lat !== "number" || typeof doc.lng !== "number") {
      return next(new Error("Verified addresses must include placeId and lat/lng"));
    }
  }
  next();
});

AddressSchema.index({ ownerUserId: 1, isDefault: 1 });
AddressSchema.index({ placeId: 1 });

export const Address = model<AddressDoc>("Address", AddressSchema);