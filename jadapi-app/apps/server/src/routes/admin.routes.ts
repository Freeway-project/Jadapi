import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { requireSuperAdmin, requireAdmin } from "../middlewares/adminAuth";
import { activityLogger } from "../middlewares/activityLogger";

const router = Router();

// All admin routes require authentication (add your auth middleware here)
// Example: router.use(requireAuth);

// Super admin only routes
router.get(
  "/dashboard/stats",
  requireSuperAdmin,
  activityLogger,
  AdminController.getDashboardStats
);

router.get(
  "/metrics",
  requireSuperAdmin,
  activityLogger,
  AdminController.getSystemMetrics
);

// Admin and super admin routes
router.get(
  "/activity",
  requireAdmin,
  activityLogger,
  AdminController.getRecentActivity
);

router.get(
  "/activity/user/:userId",
  requireAdmin,
  activityLogger,
  AdminController.getUserActivity
);

router.get(
  "/orders/active",
  requireAdmin,
  activityLogger,
  AdminController.getActiveOrders
);

router.get(
  "/orders",
  requireAdmin,
  activityLogger,
  AdminController.getOrders
);

router.get(
  "/users",
  requireAdmin,
  activityLogger,
  AdminController.getUsers
);

// Driver management routes
router.post(
  "/drivers",
  requireSuperAdmin,
  activityLogger,
  AdminController.createDriver
);

router.get(
  "/drivers",
  requireAdmin,
  activityLogger,
  AdminController.getDrivers
);

router.put(
  "/drivers/:driverId/status",
  requireSuperAdmin,
  activityLogger,
  AdminController.updateDriverStatus
);

export default router;
