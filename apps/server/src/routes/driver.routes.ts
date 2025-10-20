import { Router } from 'express';
import { DriverController } from '../controllers/driver.controller';
import { DriverLocationController } from '../controllers/driverLocation.controller';

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
// Driver Management Routes (No Auth)
// Dashboard, orders, and statistics
// ===========================

/**
 * Get driver dashboard
 * GET /api/driver/dashboard/:driverId
 */
router.get('/dashboard/:driverId', DriverController.getDashboard);

/**
 * Get driver statistics
 * GET /api/driver/stats/:driverId
 */
router.get('/stats/:driverId', DriverController.getStats);

/**
 * Get available orders for drivers to accept
 * GET /api/driver/orders/available
 * Query: ?limit=&skip=
 */
router.get('/orders/available', DriverController.getAvailableOrders);

/**
 * Get driver's assigned orders
 * GET /api/driver/orders/:driverId
 * Query: ?status=&limit=&skip=
 */
router.get('/orders/:driverId', DriverController.getMyOrders);

/**
 * Accept an available order
 * POST /api/driver/orders/:orderId/accept
 * Body: { driverId }
 */
router.post('/orders/:orderId/accept', DriverController.acceptOrder);

/**
 * Update order status
 * PATCH /api/driver/orders/:orderId/status
 * Body: { driverId, status }
 */
router.patch('/orders/:orderId/status', DriverController.updateOrderStatus);

export default router;
