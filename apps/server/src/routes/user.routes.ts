import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
  validateEmailVerification,
  validatePhoneVerification
} from "../middlewares/validation";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Protected routes - require authentication
router.get("/dashboard", requireAuth, UserController.getDashboard);
router.get("/profile", requireAuth, UserController.getProfile);
router.patch("/profile", requireAuth, UserController.updateProfile);

// Order routes (user's own orders)
router.get("/orders", requireAuth, UserController.getUserOrders);
router.get("/orders/:orderId", requireAuth, UserController.getOrder);
router.get("/orders/:orderId/invoice", requireAuth, UserController.getOrderInvoice);

// Payment history
router.get("/payments", requireAuth, UserController.getUserPayments);

// User management routes (admin)
router.get("/", UserController.list);
router.get("/search", UserController.searchByIdentifier);
router.get("/:id", UserController.get);
router.get("/uuid/:uuid", UserController.getByUuid);

// Verification routes
router.post("/:id/verify-email", validateEmailVerification, UserController.verifyEmail);
router.post("/:id/verify-phone", validatePhoneVerification, UserController.verifyPhone);

export default router;
