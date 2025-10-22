import { Request, Response, NextFunction } from 'express';
import { stripe, stripeConfig } from '../config/stripe';
import { PaymentService } from '../services/payment.service';
import { EmailService } from '../services/email.service';
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

  try {
    // Update order status to 'paid'
    const order = await DeliveryOrder.findById(payment.orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();
      logger.info(`✅ Order ${order.orderId} marked as paid and confirmed`);
    }

    // Get user details for email
    const user = await User.findById(payment.userId);
    if (!user) {
      logger.error(`User not found for payment ${payment._id}`);
      return;
    }

    const userEmail = user.auth?.email || user.email;
    if (!userEmail) {
      logger.error(`No email found for user ${user._id}`);
      return;
    }

    if (!order) {
      logger.error(`Order not found for payment ${payment._id}`);
      return;
    }

    // Send confirmation email to customer
    await EmailService.sendEmail({
      to: userEmail,
      subject: `Payment Confirmed - Order ${order.orderId}`,
      html: generatePaymentConfirmationEmail(order, payment, user),
      text: `
Payment Confirmed!

Order ID: ${order.orderId}
Amount Paid: ${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()}

Pickup: ${order.pickup.address}
Dropoff: ${order.dropoff.address}

Thank you for choosing JadAPI!
      `.trim(),
    });

    logger.info(`✅ Payment confirmation email sent to ${userEmail}`);
  } catch (error) {
    logger.error(`Failed to send payment confirmation email:`, error);
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

/**
 * Generate HTML email template for payment confirmation
 */
function generatePaymentConfirmationEmail(order: any, payment: any, user: any): string {
  const userName = user.profile?.name || user.profile?.displayName || user.auth?.email || 'Customer';
  const amountPaid = (payment.amount / 100).toFixed(2);
  const currency = payment.currency.toUpperCase();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 40px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ✅ Payment Confirmed!
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                    Your delivery is confirmed
                  </p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Hi ${userName},
                  </p>
                  <p style="margin: 0 0 30px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                    Thank you for your payment! Your order has been confirmed and will be processed shortly.
                  </p>

                  <!-- Order Details -->
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: bold;">
                      Order Details
                    </h2>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Order ID:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">
                          ${order.orderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Amount Paid:</td>
                        <td style="color: #059669; font-size: 18px; font-weight: bold; text-align: right; padding: 8px 0;">
                          ${currency} $${amountPaid}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Status:</td>
                        <td style="text-align: right; padding: 8px 0;">
                          <span style="background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            CONFIRMED
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Delivery Details -->
                  <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: bold;">
                      Delivery Information
                    </h2>

                    <div style="margin-bottom: 15px;">
                      <div style="display: flex; align-items: start; margin-bottom: 8px;">
                        <div style="background-color: #2563eb; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 10px; flex-shrink: 0;">
                          A
                        </div>
                        <div style="flex: 1;">
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600;">PICKUP</p>
                          <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; line-height: 1.4;">
                            ${order.pickup.address}
                          </p>
                          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 13px;">
                            ${order.pickup.contactName} • ${order.pickup.contactPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style="border-left: 2px dashed #bfdbfe; height: 20px; margin-left: 11px;"></div>

                    <div>
                      <div style="display: flex; align-items: start;">
                        <div style="background-color: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 10px; flex-shrink: 0;">
                          B
                        </div>
                        <div style="flex: 1;">
                          <p style="margin: 0; color: #6b7280; font-size: 12px; font-weight: 600;">DROPOFF</p>
                          <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; line-height: 1.4;">
                            ${order.dropoff.address}
                          </p>
                          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 13px;">
                            ${order.dropoff.contactName} • ${order.dropoff.contactPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Package Details -->
                  ${order.package ? `
                  <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>Package:</strong> ${order.package.size} ${order.package.description ? `• ${order.package.description}` : ''}
                    </p>
                  </div>
                  ` : ''}

                  <!-- Next Steps -->
                  <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 10px 0; color: #065f46; font-size: 16px; font-weight: bold;">
                      What's Next?
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #065f46;">
                      <li style="margin-bottom: 8px;">Your order is being processed</li>
                      <li style="margin-bottom: 8px;">A driver will be assigned shortly</li>
                      <li>You'll receive updates via email</li>
                    </ul>
                  </div>

                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    Thank you for choosing JadAPI!
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    If you have any questions, please don't hesitate to contact us.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 40px; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} JadAPI. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
