import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
  validateEmailVerification,
  validatePhoneVerification
} from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";

const router = Router();

// User management routes
router.get("/", UserController.list);
router.get("/search", UserController.searchByIdentifier);
router.get("/dashboard", authenticate, UserController.getDashboard);
router.get("/:id", UserController.get);
router.get("/uuid/:uuid", UserController.getByUuid);
router.patch("/:id/profile", UserController.updateProfile);

// Verification routes
router.post("/:id/verify-email", validateEmailVerification, UserController.verifyEmail);
router.post("/:id/verify-phone", validatePhoneVerification, UserController.verifyPhone);

export default router;
