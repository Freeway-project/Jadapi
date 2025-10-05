import { Schema, model, Document, Types } from "mongoose";

export interface ActivityLogDoc extends Document<Types.ObjectId> {
  userId?: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<ActivityLogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    method: { type: String },
    endpoint: { type: String },
    statusCode: { type: Number },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Compound indexes for common queries
ActivityLogSchema.index({ userId: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });
ActivityLogSchema.index({ resource: 1, timestamp: -1 });

export const ActivityLog = model<ActivityLogDoc>("ActivityLog", ActivityLogSchema);
