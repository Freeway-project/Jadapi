import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { OtpController } from "../controllers/otp.controller";
import {
  validateSignup,
  validateEmailVerification,
  validatePhoneVerification,
  validateOtpRequest,
  validateOtpVerification
} from "../middlewares/validation";

const router = Router();

// Health check
router.get("/health", (_req, res) => res.json({ ok: true }));

// OTP routes
router.post("/auth/otp/request", validateOtpRequest, OtpController.requestOtp);
router.post("/auth/otp/verify", validateOtpVerification, OtpController.verifyOtp);
router.get("/auth/otp/status", OtpController.checkVerificationStatus);

// Auth routes
router.post("/auth/signup", validateSignup, UserController.signup);

// User management routes
router.get("/users", UserController.list);
router.get("/users/:id", UserController.get);
router.get("/users/uuid/:uuid", UserController.getByUuid);

// Verification routes
router.post("/users/:id/verify-email", validateEmailVerification, UserController.verifyEmail);
router.post("/users/:id/verify-phone", validatePhoneVerification, UserController.verifyPhone);

export default router;
