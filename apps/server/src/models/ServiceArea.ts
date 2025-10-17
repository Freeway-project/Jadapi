import { Schema, model, Document, Types } from "mongoose";

export interface ServiceAreaDoc extends Document<Types.ObjectId> {
  name: string;                    // "Burnaby", "Surrey", "Vancouver"
  description?: string;            // Optional description for the service area
  type: "city" | "district" | "region";
  province: string;                // "BC"
  country: string;                 // "CA"
  postalCodePatterns: string[];    // ["V5H", "V5J"] for Burnaby
  isActive: boolean;               // Admin can enable/disable areas
  status: "active" | "inactive" | "maintenance";
  priority: number;                // Priority for overlapping areas
  deliveryFee?: number;            // Optional delivery fee for this area
  estimatedDeliveryHours?: number; // Estimated delivery time
  serviceConfig: {
    deliveryEnabled: boolean;
    pickupEnabled: boolean;
    sameDay: boolean;
    nextDay: boolean;
    expressDelivery: boolean;
  };
  boundaries: {
    type: "postalCode" | "postal_codes" | "radius" | "polygon";
    postalCodes?: string[];
    radius?: {
      center: {
        lat: number;
        lng: number;
      };
      distance: number;
      radiusKm: number;             // Alias for compatibility
      unit: "km" | "miles";
    };
    polygon?: {
      lat: number;
      lng: number;
    }[];
  };
  operatingHours?: Map<string, {
    enabled: boolean;
    start: string;
    end: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceAreaSchema = new Schema<ServiceAreaDoc>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ["city", "district", "region"],
      default: "city"
    },
    province: {
      type: String,
      required: true,
      default: "BC",
      trim: true
    },
    country: {
      type: String,
      required: true,
      default: "CA",
      trim: true
    },
    postalCodePatterns: [{
      type: String,
      trim: true,
      uppercase: true
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active"
    },
    priority: {
      type: Number,
      default: 0,
      index: true
    },
    deliveryFee: {
      type: Number,
      min: 0
    },
    estimatedDeliveryHours: {
      type: Number,
      min: 0
    },
    serviceConfig: {
      deliveryEnabled: { type: Boolean, default: true },
      pickupEnabled: { type: Boolean, default: true },
      sameDay: { type: Boolean, default: false },
      nextDay: { type: Boolean, default: true },
      expressDelivery: { type: Boolean, default: false }
    },
    boundaries: {
      type: {
        type: String,
        enum: ["postalCode", "postal_codes", "radius", "polygon"],
        default: "postalCode"
      },
      postalCodes: [{
        type: String,
        trim: true,
        uppercase: true
      }],
      radius: {
        center: {
          lat: { type: Number },
          lng: { type: Number }
        },
        distance: { type: Number, min: 0 },
        radiusKm: { type: Number, min: 0 },
        unit: { type: String, enum: ["km", "miles"], default: "km" }
      },
      polygon: [{
        lat: { type: Number },
        lng: { type: Number }
      }]
    },
    operatingHours: {
      type: Map,
      of: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" }
      }
    }
  },
  { timestamps: true }
);

// Ensure unique service area names within same province
ServiceAreaSchema.index({ name: 1, province: 1 }, { unique: true });

export const ServiceArea = model<ServiceAreaDoc>("ServiceArea", ServiceAreaSchema);