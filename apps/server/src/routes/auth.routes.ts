import { Router } from "express";
import { OtpController } from "../controllers/otp.controller";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import {
  validateOtpRequest,
  validateOtpVerification,
  validateSignup
} from "../middlewares/validation";

const router = Router();

// OTP routes
router.post("/otp/request", validateOtpRequest, OtpController.requestOtp);
router.post("/otp/verify", validateOtpVerification, OtpController.verifyOtp);
router.get("/otp/status", OtpController.checkVerificationStatus);

// Auth routes
router.post("/signup", validateSignup, UserController.signup);
router.post("/login", AuthController.login);
router.post("/driver-login", AuthController.driverLogin);
router.post("/create-admin", AuthController.createAdmin);
router.post("/create-driver", AuthController.createDriver);

export default router;
