import { Schema, model, Document, Types } from "mongoose";

export interface ServiceAreaDoc extends Document<Types.ObjectId> {
  name: string;                    // "Burnaby", "Surrey", "Vancouver"
  type: "city" | "district" | "region";
  province: string;                // "BC"
  country: string;                 // "CA"
  postalCodePatterns: string[];    // ["V5H", "V5J"] for Burnaby
  isActive: boolean;               // Admin can enable/disable areas
  deliveryFee?: number;            // Optional delivery fee for this area
  estimatedDeliveryHours?: number; // Estimated delivery time
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
    deliveryFee: { 
      type: Number, 
      min: 0 
    },
    estimatedDeliveryHours: { 
      type: Number, 
      min: 0 
    }
  },
  { timestamps: true }
);

// Ensure unique service area names within same province
ServiceAreaSchema.index({ name: 1, province: 1 }, { unique: true });

export const ServiceArea = model<ServiceAreaDoc>("ServiceArea", ServiceAreaSchema);