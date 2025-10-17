import { Schema, model, Document, Types } from "mongoose";
import { DeliveryAreaValidator } from "../utils/deliveryAreaValidator";

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
  serviceAreaId?: Types.ObjectId; // Link to ServiceArea for delivery validation
  deliveryRestrictions?: {
    canDeliver: boolean;
    canPickup: boolean;
    availableServices: string[];
    lastChecked: Date;
    checkNotes?: string;
  };
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
    serviceAreaId: { type: Schema.Types.ObjectId, ref: "ServiceArea" },
    deliveryRestrictions: {
      canDeliver: { type: Boolean, default: true },
      canPickup: { type: Boolean, default: true },
      availableServices: [{ type: String }],
      lastChecked: { type: Date, default: Date.now },
      checkNotes: { type: String }
    },
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

// Validate delivery area when address is saved
AddressSchema.pre("save", async function (next: any) {
  const doc = this as any;
  
  // Only validate if coordinates or postal code changed
  if (doc.isModified('lat') || doc.isModified('lng') || doc.isModified('pincode') || doc.isNew) {
    try {
      const validation = await DeliveryAreaValidator.validateAddress(doc.lat, doc.lng, doc.pincode);
      
      // Update delivery restrictions based on validation
      if (!doc.deliveryRestrictions) {
        doc.deliveryRestrictions = {};
      }
      
      doc.deliveryRestrictions.canDeliver = validation.isValid;
      doc.deliveryRestrictions.canPickup = validation.availableServices?.pickup || false;
      doc.deliveryRestrictions.availableServices = [];
      doc.deliveryRestrictions.lastChecked = new Date();
      
      if (validation.isValid && validation.availableServices) {
        if (validation.availableServices.delivery) doc.deliveryRestrictions.availableServices.push('delivery');
        if (validation.availableServices.pickup) doc.deliveryRestrictions.availableServices.push('pickup');
        if (validation.availableServices.sameDay) doc.deliveryRestrictions.availableServices.push('same-day');
        if (validation.availableServices.nextDay) doc.deliveryRestrictions.availableServices.push('next-day');
        if (validation.availableServices.express) doc.deliveryRestrictions.availableServices.push('express');
        
        // Link to service area
        if (validation.serviceArea) {
          doc.serviceAreaId = (validation.serviceArea as any)._id;
        }
      } else {
        doc.deliveryRestrictions.checkNotes = validation.reasons.join('; ');
      }
      
    } catch (error) {
      // Log error but don't fail the save
      console.error('Delivery area validation error:', error);
      if (!doc.deliveryRestrictions) {
        doc.deliveryRestrictions = {};
      }
      doc.deliveryRestrictions.canDeliver = false;
      doc.deliveryRestrictions.checkNotes = `Validation failed: ${error}`;
      doc.deliveryRestrictions.lastChecked = new Date();
    }
  }
  
  next();
});

AddressSchema.index({ ownerUserId: 1, isDefault: 1 });
AddressSchema.index({ placeId: 1 });

export const Address = model<AddressDoc>("Address", AddressSchema);