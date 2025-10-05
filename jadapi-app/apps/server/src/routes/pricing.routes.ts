import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';

const router = Router();

/**
 * Pricing and fare estimation routes
 */

// Fare estimation
router.post('/estimate', PricingController.getFareEstimate);
router.post('/fare-range', PricingController.getFareRange);

// Distance calculation
router.post('/distance', PricingController.calculateDistance);

// Configuration and service areas
router.get('/config', PricingController.getPricingConfig);
router.get('/service-areas', PricingController.getServiceAreas);
router.get('/rate-card', PricingController.getRateCard);

// Location validation
router.post('/validate-location', PricingController.validateLocation);

export default router;
