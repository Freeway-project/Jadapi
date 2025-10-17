import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { activityLogger } from "../middlewares/activityLogger";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Dashboard and metrics routes
router.get(
  "/dashboard/stats",
  activityLogger,
  AdminController.getDashboardStats
);

router.get(
  "/metrics",
  activityLogger,
  AdminController.getSystemMetrics
);

// Admin routes
router.get(
  "/activity",
  activityLogger,
  AdminController.getRecentActivity
);

router.get(
  "/activity/user/:userId",
  activityLogger,
  AdminController.getUserActivity
);

router.get(
  "/orders/active",
  activityLogger,
  AdminController.getActiveOrders
);

router.get(
  "/orders",
  activityLogger,
  AdminController.getOrders
);

router.get(
  "/users",
  activityLogger,
  AdminController.getUsers
);

// Driver management routes
router.post(
  "/drivers",
  activityLogger,
  AdminController.createDriver
);

router.get(
  "/drivers",
  activityLogger,
  AdminController.getDrivers
);

router.put(
  "/drivers/:driverId/status",
  activityLogger,
  AdminController.updateDriverStatus
);

export default router;
