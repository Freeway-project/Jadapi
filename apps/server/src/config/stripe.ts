import Stripe from 'stripe';
import { ENV } from './env';
import { logger } from '../utils/logger';

// Initialize Stripe with secret key
if (!ENV.STRIPE_SECRET_KEY) {
  logger.warn('⚠️  STRIPE_SECRET_KEY not configured. Payment features will not work.');
}

export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Stripe configuration
export const stripeConfig = {
  publishableKey: ENV.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: ENV.STRIPE_WEBHOOK_SECRET,
  currency: 'cad',
  // Payment capture method: 'automatic' or 'manual'
  // Using 'automatic' means Stripe captures payment immediately when confirmed
  captureMethod: 'automatic' as const,
  // Optional: allow configuring allowed payment method types via env var (comma separated)
  // Example: STRIPE_PAYMENT_METHODS=card,us_bank_account
  paymentMethodTypes:['card']
};

logger.info('✅ Stripe initialized');
