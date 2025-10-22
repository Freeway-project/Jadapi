import { stripe, stripeConfig } from '../config/stripe';
import { Payment, IPayment } from '../models/Payment';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import Stripe from 'stripe';

export interface CreatePaymentIntentData {
  orderId: string;
  userId: string;
  amount: number; // Amount in cents
  currency?: string;
  metadata?: Record<string, any>;
}

export const PaymentService = {
  /**
   * Create a PaymentIntent for a delivery order
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    payment: IPayment;
    clientSecret: string;
  }> {
    try {
      const { orderId, userId, amount, currency = 'cad', metadata = {} } = data;

      // Validate amount (minimum $0.50)
      if (amount < 50) {
        throw new ApiError(400, 'Payment amount must be at least $0.50');
      }

      // Create PaymentIntent on Stripe
      // Build PaymentIntent params. If explicit payment method types are configured
      // via environment (stripeConfig.paymentMethodTypes), prefer those. Otherwise
      // fall back to automatic payment methods.
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount), // Ensure integer
        currency: currency.toLowerCase(),
        metadata: {
          orderId,
          userId,
          ...metadata,
        },
        capture_method: stripeConfig.captureMethod,
      };

      if (stripeConfig.paymentMethodTypes && stripeConfig.paymentMethodTypes.length > 0) {
        // Use explicit payment_method_types (e.g., ['card'])
        paymentIntentParams.payment_method_types = stripeConfig.paymentMethodTypes as any;
      } else {
        // Let Stripe decide available payment methods automatically
        (paymentIntentParams as any).automatic_payment_methods = { enabled: true };
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Create payment record in database
      const payment = await Payment.create({
        orderId,
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency: currency.toLowerCase(),
        status: 'pending',
        metadata: {
          orderId,
          ...metadata,
        },
        stripeEvents: [],
      });

      logger.info(`✅ PaymentIntent created: ${paymentIntent.id} for order ${orderId}`);

      return {
        paymentIntent,
        payment,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error: any) {
      logger.error('Failed to create PaymentIntent:', error);
      throw new ApiError(500, `Payment initialization failed: ${error.message}`);
    }
  },

  /**
   * Get payment by PaymentIntent ID
   */
  async getPaymentByIntent(paymentIntentId: string): Promise<IPayment | null> {
    return Payment.findOne({ stripePaymentIntentId: paymentIntentId });
  },

  /**
   * Get payment by Order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    return Payment.findOne({ orderId }).sort({ createdAt: -1 });
  },

  /**
   * Update payment status from webhook event
   */
  async updatePaymentFromWebhook(
    paymentIntentId: string,
    event: Stripe.Event
  ): Promise<IPayment> {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      throw new ApiError(404, `Payment not found for PaymentIntent: ${paymentIntentId}`);
    }

    // Idempotency check: Have we already processed this exact event?
    const eventExists = payment.stripeEvents.some((e) => e.eventId === event.id);
    if (eventExists) {
      logger.info(`⚠️  Event ${event.id} already processed for payment ${payment._id}`);
      return payment;
    }

    // Map Stripe PaymentIntent status to our payment status
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    let newStatus: IPayment['status'] = payment.status;

    switch (paymentIntent.status) {
      case 'processing':
        newStatus = 'processing';
        break;
      case 'succeeded':
        newStatus = 'succeeded';
        payment.paymentMethod = paymentIntent.payment_method as string;
        break;
      case 'canceled':
        newStatus = 'canceled';
        break;
      case 'requires_payment_method':
        newStatus = 'failed';
        payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
        break;
    }

    // Add event to history
    payment.stripeEvents.push({
      eventId: event.id,
      type: event.type,
      createdAt: new Date(event.created * 1000),
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      },
    });

    payment.status = newStatus;
    payment.updatedAt = new Date();

    await payment.save();

    logger.info(`✅ Payment ${payment._id} updated to status: ${newStatus} (event: ${event.type})`);

    return payment;
  },

  /**
   * Check if an event has already been processed (idempotency)
   */
  async isEventProcessed(eventId: string): Promise<boolean> {
    const payment = await Payment.findOne({
      'stripeEvents.eventId': eventId,
    });
    return !!payment;
  },

  /**
   * Retrieve PaymentIntent from Stripe (for verification)
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error: any) {
      logger.error(`Failed to retrieve PaymentIntent ${paymentIntentId}:`, error);
      throw new ApiError(500, `Failed to retrieve payment: ${error.message}`);
    }
  },

  /**
   * Cancel a PaymentIntent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<IPayment> {
    try {
      // Cancel on Stripe
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

      // Update our database
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          $set: {
            status: 'canceled',
            updatedAt: new Date(),
          },
          $push: {
            stripeEvents: {
              eventId: `cancel_${Date.now()}`,
              type: 'payment_intent.canceled',
              createdAt: new Date(),
              data: { status: paymentIntent.status },
            },
          },
        },
        { new: true }
      );

      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      logger.info(`✅ PaymentIntent ${paymentIntentId} canceled`);
      return payment;
    } catch (error: any) {
      logger.error(`Failed to cancel PaymentIntent ${paymentIntentId}:`, error);
      throw new ApiError(500, `Failed to cancel payment: ${error.message}`);
    }
  },

  /**
   * Get Stripe publishable key (safe to expose to frontend)
   */
  getPublishableKey(): string {
    return stripeConfig.publishableKey;
  },
};
