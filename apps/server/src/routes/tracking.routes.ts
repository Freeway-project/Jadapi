import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller';

const router = Router();

/**
 * Public tracking endpoints (no authentication required)
 */

// Track order by order ID
router.get('/:orderId', TrackingController.trackOrder);

// Get driver location for an order
router.get('/:orderId/driver-location', TrackingController.getDriverLocation);

export default router;
