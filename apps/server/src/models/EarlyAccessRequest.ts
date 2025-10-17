import { Schema, model, Document, Types } from "mongoose";

export interface EarlyAccessRequestDoc extends Document<Types.ObjectId> {
  pickupAddress: string;
  dropoffAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  estimatedFare?: {
    distance?: number;
    total?: number;
    currency?: string;
  };
  status: "pending" | "contacted" | "converted" | "declined";
  notes?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EarlyAccessRequestSchema = new Schema<EarlyAccessRequestDoc>(
  {
    pickupAddress: {
      type: String,
      required: true,
    },
    dropoffAddress: {
      type: String,
      required: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
      index: true,
    },
    contactEmail: {
      type: String,
    },
    estimatedFare: {
      distance: Number,
      total: Number,
      currency: { type: String, default: "CAD" },
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "converted", "declined"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
    },
    source: {
      type: String,
      default: "web-app",
    },
  },
  { timestamps: true }
);

// Indexes for common queries
EarlyAccessRequestSchema.index({ status: 1, createdAt: -1 });
EarlyAccessRequestSchema.index({ contactPhone: 1, createdAt: -1 });

export const EarlyAccessRequest = model<EarlyAccessRequestDoc>(
  "EarlyAccessRequest",
  EarlyAccessRequestSchema
);
