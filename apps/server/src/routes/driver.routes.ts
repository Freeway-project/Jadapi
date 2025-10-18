import { Router } from "express";
import { DriverController } from "../controllers/driver.controller";
import { authenticate } from "../middlewares/auth";
import { driverAuth } from "../middlewares/driverAuth";

const router = Router();

// All routes require authentication and driver role
router.use(authenticate);
router.use(driverAuth);

/**
 * GET /api/driver/dashboard
 * Get driver dashboard with profile, stats, and active orders
 */
router.get("/dashboard", DriverController.getDashboard);

/**
 * GET /api/driver/stats
 * Get driver statistics (total deliveries, earnings, etc.)
 */
router.get("/stats", DriverController.getStats);

/**
 * GET /api/driver/orders/available
 * Get available orders for drivers to accept
 */
router.get("/orders/available", DriverController.getAvailableOrders);

/**
 * GET /api/driver/orders
 * Get driver's assigned orders
 * Query params: status, limit, skip
 */
router.get("/orders", DriverController.getMyOrders);

/**
 * POST /api/driver/orders/:orderId/accept
 * Accept an available order
 */
router.post("/orders/:orderId/accept", DriverController.acceptOrder);

/**
 * PATCH /api/driver/orders/:orderId/status
 * Update order status (picked_up, in_transit, delivered, cancelled)
 * Body: { status: string }
 */
router.patch("/orders/:orderId/status", DriverController.updateOrderStatus);

export default router;
