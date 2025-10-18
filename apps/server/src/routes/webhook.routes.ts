import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();

/**
 * Stripe webhook endpoint
 * IMPORTANT: This endpoint must use raw body for signature verification
 * The raw body middleware is configured in the main server.ts file
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  WebhookController.handleStripeWebhook
);

export default router;
