import { Request, Response, NextFunction } from 'express';
import { stripe, stripeConfig } from '../config/stripe';
import { PaymentService } from '../services/payment.service';
import { EmailService } from '../services/email.service';
import { InvoiceService } from '../services/invoice.service';
import { DeliveryOrder } from '../models/DeliveryOrder';
import { User } from '../models/user.model';
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
      logger.error({ error }, `Webhook processing error`);
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

  try {
    // Update order payment status to 'paid'
    const order = await DeliveryOrder.findById(payment.orderId);
    if (!order) {
      logger.error(`Order not found for payment ${payment._id}`);
      return;
    }

    order.paymentStatus = 'paid';
    // Keep order status as-is (not tied to driver assignment)
    await order.save();
    logger.info(`✅ Order ${order.orderId} payment status updated to paid`);

    // Get user details for invoice
    const user = await User.findById(payment.userId);
    if (!user) {
      logger.error(`User not found for payment ${payment._id}`);
      return;
    }

    const userEmail = user.auth?.email;
    if (!userEmail) {
      logger.error(`No email found for user ${user._id}`);
      return;
    }

    // Generate invoice
    const invoice = InvoiceService.generateInvoice(order, user, payment.stripePaymentIntentId);
    logger.info(`✅ Invoice ${invoice.invoiceNumber} generated for order ${order.orderId}`);

    // Send invoice email
    await EmailService.sendEmail({
      to: userEmail,
      subject: `Invoice ${invoice.invoiceNumber} - Payment Confirmed`,
      html: InvoiceService.generateInvoiceEmail(invoice),
      text: InvoiceService.generateInvoiceTextEmail(invoice),
    });

    logger.info(`✅ Invoice email sent to ${userEmail}`);
  } catch (error) {
    logger.error({ error }, `Failed to process payment success`);
    // Don't throw - we don't want to fail the webhook
  }

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
