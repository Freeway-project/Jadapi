import { Router } from 'express';
import { DriverController } from '../controllers/driver.controller';
import { DriverLocationController } from '../controllers/driverLocation.controller';
import { requireAuth } from '../middlewares/auth';
import { driverAuth } from '../middlewares/driverAuth';

const router = Router();

// ===========================
// Driver Location Routes (No Auth)
// Real-time location tracking for drivers
// ===========================

/**
 * Update driver location
 * POST /api/driver/location
 * Body: { driverId, lat, lng, heading?, speed? }
 */
router.post('/location', DriverLocationController.updateLocation);

/**
 * Get all active drivers
 * GET /api/driver/locations
 * Query: ?north=&south=&east=&west=&limit=
 */
router.get('/locations', DriverLocationController.getActiveDrivers);

/**
 * Get single driver location
 * GET /api/driver/location/:driverId
 */
router.get('/location/:driverId', DriverLocationController.getDriverLocation);

/**
 * Remove driver from active list (going offline)
 * DELETE /api/driver/location/:driverId
 */
router.delete('/location/:driverId', DriverLocationController.removeDriver);

// ===========================
// Driver Management Routes (Auth Required)
// Dashboard, orders, and statistics
// ===========================

/**
 * Get driver dashboard
 * GET /api/driver/dashboard
 * Requires: Driver authentication
 */
router.get('/dashboard', requireAuth, driverAuth, DriverController.getDashboard);

/**
 * Get driver statistics
 * GET /api/driver/stats
 * Requires: Driver authentication
 */
router.get('/stats', requireAuth, driverAuth, DriverController.getStats);

/**
 * Get available orders for drivers to accept
 * GET /api/driver/orders/available
 * Query: ?limit=&skip=
 * Requires: Driver authentication
 */
router.get('/orders/available', requireAuth, driverAuth, DriverController.getAvailableOrders);

/**
 * Get driver's assigned orders
 * GET /api/driver/orders
 * Query: ?status=&limit=&skip=
 * Requires: Driver authentication
 */
router.get('/orders', requireAuth, driverAuth, DriverController.getMyOrders);

/**
 * Accept an available order
 * POST /api/driver/orders/:orderId/accept
 * Requires: Driver authentication
 */
router.post('/orders/:orderId/accept', requireAuth, driverAuth, DriverController.acceptOrder);

/**
 * Update order status
 * PATCH /api/driver/orders/:orderId/status
 * Body: { status }
 * Requires: Driver authentication
 */
router.patch('/orders/:orderId/status', requireAuth, driverAuth, DriverController.updateOrderStatus);

export default router;
