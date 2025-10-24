import { Schema, model, Document, Types } from "mongoose";

export interface DeliveryOrderDoc extends Document<Types.ObjectId> {
  orderId: string;
  userId: Types.ObjectId;
  status: "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";

  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
    location?: {
      type: string;
      coordinates: [number, number]; // [lng, lat] for GeoJSON
    };
    contactName?: string;
    contactPhone?: string;
    notes?: string;
    scheduledAt?: Date;
    actualAt?: Date;
  };

  dropoff: {
    address: string;
    coordinates: { lat: number; lng: number };
    location?: {
      type: string;
      coordinates: [number, number]; // [lng, lat] for GeoJSON
    };
    contactName?: string;
    contactPhone?: string;
    notes?: string;
    scheduledAt?: Date;
    actualAt?: Date;
  };

  package: {
    size: "XS" | "S" | "M" | "L";
    weight?: string;
    description?: string;
  };

  pricing: {
    baseFare: number;
    distanceFare: number;
    subtotal: number;
    tax: number;
    couponDiscount?: number;
    total: number;
    currency: string;
  };

  coupon?: {
    code: string;
    couponId: Types.ObjectId;
    discountType: string;
    discountValue?: number;
  };

  distance: {
    km: number;
    durationMinutes: number;
  };

  driverId?: Types.ObjectId;

  Qrid?: string;
  timeline: {
    createdAt: Date;
    assignedAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const DeliveryOrderSchema = new Schema<DeliveryOrderDoc>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "assigned", "picked_up", "in_transit", "delivered", "cancelled"],
      default: "pending",
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
      required: true,
      index: true
    },

    pickup: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      location: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] } // [lng, lat] - GeoJSON format
      },
      contactName: String,
      contactPhone: String,
      notes: String,
      scheduledAt: Date,
      actualAt: Date
    },

    dropoff: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      location: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] } // [lng, lat] - GeoJSON format
      },
      contactName: String,
      contactPhone: String,
      notes: String,
      scheduledAt: Date,
      actualAt: Date
    },

    package: {
      size: { type: String, enum: ["XS", "S", "M", "L"], required: true },
      weight: String,
      description: String
    },
    Qrid: { type: String,  },

    pricing: {
      baseFare: { type: Number, required: true },

      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true },
      couponDiscount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: "CAD" }
    },

    coupon: {
      code: String,
      couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
      discountType: String,
      discountValue: Number
    },

    distance: {
      km: { type: Number, required: true },
      durationMinutes: { type: Number, required: true }
    },

    driverId: { type: Schema.Types.ObjectId, ref: "User", index: true },


    timeline: {
      createdAt: { type: Date, default: Date.now },
      assignedAt: Date,
      pickedUpAt: Date,
      deliveredAt: Date,
      cancelledAt: Date
    }
  },
  { timestamps: true }
);

// Indexes for common queries
DeliveryOrderSchema.index({ status: 1, createdAt: -1 });
DeliveryOrderSchema.index({ userId: 1, createdAt: -1 });
DeliveryOrderSchema.index({ driverId: 1, status: 1 });

// Geospatial indexes for location-based queries
DeliveryOrderSchema.index({ "pickup.location": "2dsphere" });
DeliveryOrderSchema.index({ "dropoff.location": "2dsphere" });

export const DeliveryOrder = model<DeliveryOrderDoc>("DeliveryOrder", DeliveryOrderSchema);
