import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const validateSignup = (req: Request, _res: Response, next: NextFunction) => {
  const { accountType, email, phone, displayName, legalName } = req.body;

  // Required fields validation
  if (!accountType) {
    return next(new ApiError(400, "Account type is required"));
  }

  if (!["individual", "business"].includes(accountType)) {
    return next(new ApiError(400, "Account type must be 'individual' or 'business'"));
  }

  if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
    return next(new ApiError(400, "Display name is required"));
  }

  // Either email or phone must be provided
  if (!email && !phone) {
    return next(new ApiError(400, "Either email or phone is required"));
  }

  // Email validation
  if (email) {
    if (typeof email !== "string") {
      return next(new ApiError(400, "Email must be a string"));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError(400, "Invalid email format"));
    }
  }

  // Phone validation (basic E.164 format check)
  if (phone) {
    if (typeof phone !== "string") {
      return next(new ApiError(400, "Phone must be a string"));
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return next(new ApiError(400, "Phone must be in E.164 format (e.g., +16045551234)"));
    }
  }

  // Business account specific validation
  if (accountType === "business") {
    if (!legalName || typeof legalName !== "string" || legalName.trim().length === 0) {
      return next(new ApiError(400, "Legal name is required for business accounts"));
    }
  }

  // Sanitize strings
  req.body.displayName = displayName.trim();
  if (email) {
    req.body.email = email.toLowerCase().trim();
  }
  if (phone) {
    req.body.phone = phone.trim();
  }
  if (legalName) {
    req.body.legalName = legalName.trim();
  }

  next();
};

export const validateEmailVerification = (req: Request, _res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError(400, "User ID is required"));
  }

  // Basic MongoDB ObjectId validation
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return next(new ApiError(400, "Invalid user ID format"));
  }

  next();
};

export const validatePhoneVerification = validateEmailVerification;

export const validateOtpRequest = (req: Request, _res: Response, next: NextFunction) => {
  const { email, type } = req.body;

  if (!email || typeof email !== "string") {
    return next(new ApiError(400, "Email is required"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, "Invalid email format"));
  }

  if (type && !["signup", "login", "password_reset"].includes(type)) {
    return next(new ApiError(400, "Invalid OTP type"));
  }

  // Sanitize email
  req.body.email = email.toLowerCase().trim();

  next();
};

export const validateOtpVerification = (req: Request, _res: Response, next: NextFunction) => {
  const { email, code, type } = req.body;

  if (!email || typeof email !== "string") {
    return next(new ApiError(400, "Email is required"));
  }

  if (!code || typeof code !== "string") {
    return next(new ApiError(400, "OTP code is required"));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, "Invalid email format"));
  }

  // OTP code should be 6 digits
  const codeRegex = /^\d{6}$/;
  if (!codeRegex.test(code)) {
    return next(new ApiError(400, "OTP code must be 6 digits"));
  }

  if (type && !["signup", "login", "password_reset"].includes(type)) {
    return next(new ApiError(400, "Invalid OTP type"));
  }

  // Sanitize
  req.body.email = email.toLowerCase().trim();
  req.body.code = code.trim();

  next();
};