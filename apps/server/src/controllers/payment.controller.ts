import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const PaymentController = {
  /**
   * Create a PaymentIntent for an order
   * POST /api/payment/create-intent
   */
  async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, amount, currency, metadata } = req.body;
      const user = (req as any).user;
      
      // requireAuth middleware already ensures user exists, but double-check for safety
      if (!user || !user._id) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!orderId || !amount) {
        throw new ApiError(400, 'Order ID and amount are required');
      }

      const result = await PaymentService.createPaymentIntent({
        orderId,
        userId: user._id.toString(),
        amount: Math.round(amount), // Ensure integer cents
        currency,
        metadata,
      });

      res.status(201).json({
        success: true,
        data: {
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntent.id,
          amount: result.payment.amount,
          currency: result.payment.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment status by PaymentIntent ID
   * GET /api/payment/intent/:paymentIntentId
   */
  async getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentIntentId } = req.params;

      const payment = await PaymentService.getPaymentByIntent(paymentIntentId);

      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      res.json({
        success: true,
        data: {
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          failureReason: payment.failureReason,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment by order ID
   * GET /api/payment/order/:orderId
   */
  async getPaymentByOrderId(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;

      const payment = await PaymentService.getPaymentByOrderId(orderId);

      if (!payment) {
        throw new ApiError(404, 'Payment not found for this order');
      }

      res.json({
        success: true,
        data: {
          paymentIntentId: payment.stripePaymentIntentId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel a payment
   * POST /api/payment/cancel/:paymentIntentId
   */
  async cancelPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentIntentId } = req.params;

      const payment = await PaymentService.cancelPaymentIntent(paymentIntentId);

      res.json({
        success: true,
        data: {
          status: payment.status,
          message: 'Payment canceled successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Stripe publishable key
   * GET /api/payment/config
   */
  async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const publishableKey = PaymentService.getPublishableKey();

      res.json({
        success: true,
        data: {
          publishableKey,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
