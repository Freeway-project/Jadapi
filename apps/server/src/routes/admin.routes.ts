import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { activityLogger } from "../middlewares/activityLogger";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
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

// SMS usage routes
router.get(
  "/sms/usage",
  activityLogger,
  AdminController.getSmsUsage
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

router.post(
  "/drivers/:driverId/notify",
  activityLogger,
  AdminController.notifyDriver
);

// App configuration routes
router.get(
  "/config",
  activityLogger,
  AdminController.getAppConfig
);

router.put(
  "/config/active",
  activityLogger,
  AdminController.updateAppActiveStatus
);

// Early access request routes
router.get(
  "/early-access-requests",
  activityLogger,
  AdminController.getEarlyAccessRequests
);

router.put(
  "/early-access-requests/:requestId/status",
  activityLogger,
  AdminController.updateEarlyAccessRequestStatus
);

export default router;
