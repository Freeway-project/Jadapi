import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  paymentMethod?: string;
  metadata?: {
    orderId?: string;
    userEmail?: string;
    [key: string]: any;
  };
  stripeEvents: Array<{
    eventId: string;
    type: string;
    createdAt: Date;
    data?: any;
  }>;
  failureReason?: string;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'cad',
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    stripeEvents: [
      {
        eventId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        data: Schema.Types.Mixed,
      },
    ],
    failureReason: String,
    refundedAmount: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ orderId: 1, status: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ 'stripeEvents.eventId': 1 }); // For idempotency checks

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
