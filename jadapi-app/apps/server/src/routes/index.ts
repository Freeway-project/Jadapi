import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { OtpController } from "../controllers/otp.controller";
import { AuthController } from "../controllers/auth.controller";
import {
  validateSignup,
  validateEmailVerification,
  validatePhoneVerification,
  validateOtpRequest,
  validateOtpVerification
} from "../middlewares/validation";
import deliveryRoutes from "./delivery.routes";
import pricingRoutes from "./pricing.routes";
import adminRoutes from "./admin.routes";

const router = Router();




router.get("/", (req, res) => res.json({status:200, ok: true }));

// OTP routes
router.post("/auth/otp/request", validateOtpRequest, OtpController.requestOtp);
router.post("/auth/otp/verify", validateOtpVerification, OtpController.verifyOtp);
router.get("/auth/otp/status", OtpController.checkVerificationStatus);

// Auth routes
router.post("/auth/signup", validateSignup, UserController.signup);
router.post("/auth/login", AuthController.login);
router.post("/auth/create-super-admin", AuthController.createSuperAdmin);

// User management routes
router.get("/users", UserController.list);
router.get("/users/:id", UserController.get);
router.get("/users/uuid/:uuid", UserController.getByUuid);

// Verification routes
router.post("/users/:id/verify-email", validateEmailVerification, UserController.verifyEmail);
router.post("/users/:id/verify-phone", validatePhoneVerification, UserController.verifyPhone);

// Delivery routes
router.use("/delivery", deliveryRoutes);

// Pricing routes
router.use("/pricing", pricingRoutes);

// Admin routes
router.use("/admin", adminRoutes);

export default router;
