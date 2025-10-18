import { Request, Response, NextFunction } from 'express';
import { stripe, stripeConfig } from '../config/stripe';
import { PaymentService } from '../services/payment.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import Stripe from 'stripe';

export const WebhookController = {
  /**
   * Handle Stripe webhook events
   * POST /api/webhooks/stripe
   */
  async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      logger.error('⚠️  Webhook signature missing');
      return res.status(400).send('Webhook signature missing');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        stripeConfig.webhookSecret
      );

      logger.info(`✅ Webhook verified: ${event.type} (${event.id})`);
    } catch (err: any) {
      logger.error(`⚠️  Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Idempotency check: Have we already processed this event?
      const alreadyProcessed = await PaymentService.isEventProcessed(event.id);
      if (alreadyProcessed) {
        logger.info(`⚠️  Event ${event.id} already processed, skipping`);
        return res.json({ received: true, status: 'already_processed' });
      }

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.created':
          await handlePaymentIntentCreated(event);
          break;

        case 'payment_intent.processing':
          await handlePaymentIntentProcessing(event);
          break;

        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event);
          break;

        case 'payment_intent.canceled':
          await handlePaymentIntentCanceled(event);
          break;

        case 'payment_intent.requires_action':
          logger.info(`PaymentIntent ${event.data.object.id} requires action`);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      // Always respond with 200 to acknowledge receipt
      res.json({ received: true });
    } catch (error: any) {
      logger.error(`Webhook processing error:`, error);
      // Still respond with 200 to prevent Stripe from retrying
      res.json({ received: true, error: error.message });
    }
  },
};

/**
 * Handle payment_intent.created event
 */
async function handlePaymentIntentCreated(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  logger.info(`PaymentIntent created: ${paymentIntent.id}`);
  // Already created in our database when client initiated payment
}

/**
 * Handle payment_intent.processing event
 */
async function handlePaymentIntentProcessing(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  await PaymentService.updatePaymentFromWebhook(paymentIntent.id, event);

  logger.info(`✅ PaymentIntent ${paymentIntent.id} is processing`);
}

/**
 * Handle payment_intent.succeeded event
 * This is the SOURCE OF TRUTH for successful payments
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // Update payment status in database
  const payment = await PaymentService.updatePaymentFromWebhook(paymentIntent.id, event);

  logger.info(`✅ PaymentIntent ${paymentIntent.id} succeeded`);

  // TODO: Update order status to 'paid'
  // TODO: Send confirmation email to customer
  // TODO: Notify driver/dispatch system
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  await PaymentService.updatePaymentFromWebhook(paymentIntent.id, event);

  logger.error(`❌ PaymentIntent ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message}`);

  // TODO: Notify customer of payment failure
}

/**
 * Handle payment_intent.canceled event
 */
async function handlePaymentIntentCanceled(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  await PaymentService.updatePaymentFromWebhook(paymentIntent.id, event);

  logger.info(`⚠️  PaymentIntent ${paymentIntent.id} was canceled`);
}
