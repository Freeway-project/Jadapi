import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Public config endpoint (no auth required)
router.get('/config', PaymentController.getConfig);

// Protected payment endpoints (require authentication)
router.post('/create-intent', requireAuth, PaymentController.createPaymentIntent);
router.get('/intent/:paymentIntentId', requireAuth, PaymentController.getPaymentStatus);
router.get('/order/:orderId', requireAuth, PaymentController.getPaymentByOrderId);
router.post('/cancel/:paymentIntentId', requireAuth, PaymentController.cancelPayment);

export default router;
