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

    const phoneRegex = /^\[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return next(new ApiError(400, "Phone must be in E.164 format (e.g., 16045551234)"));
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
  const { email, phoneNumber, type, deliveryMethod, userType } = req.body;

  // Either email or phone number must be provided
  if (!email && !phoneNumber) {
    return next(new ApiError(400, "Either email or phone number is required"));
  }

  // For business users, both email and phone are required
  if (userType === 'business' && (!email || !phoneNumber)) {
    return next(new ApiError(400, "Business accounts require both email and phone number"));
  }

  // For individual users, phone number is required but email is optional
  if (userType === 'individual' && !phoneNumber) {
    return next(new ApiError(400, "Individual accounts require phone number"));
  }

  // Email validation if provided
  if (email) {
    if (typeof email !== "string") {
      return next(new ApiError(400, "Email must be a string"));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError(400, "Invalid email format"));
    }

    // Sanitize email
    req.body.email = email.toLowerCase().trim();
  }

  // Phone number validation if provided
  if (phoneNumber) {
    if (typeof phoneNumber !== "string") {
      return next(new ApiError(400, "Phone number must be a string"));
    }

    const phoneRegex = /^(\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return next(new ApiError(400, "Invalid phone number format"));
    }

    // Sanitize phone number
    req.body.phoneNumber = phoneNumber.trim();
  }

  if (type && !["signup", "login", "password_reset"].includes(type)) {
    return next(new ApiError(400, "Invalid OTP type"));
  }

  if (deliveryMethod && !["email", "sms", "both"].includes(deliveryMethod)) {
    return next(new ApiError(400, "Invalid delivery method"));
  }

  next();
};

export const validateOtpVerification = (req: Request, _res: Response, next: NextFunction) => {
  const { identifier, code, type } = req.body;

  if (!identifier || typeof identifier !== "string") {
    return next(new ApiError(400, "Identifier (email or phone) is required"));
  }

  if (!code || typeof code !== "string") {
    return next(new ApiError(400, "OTP code is required"));
  }

  // Validate identifier format (email or phone)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

  if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
    return next(new ApiError(400, "Identifier must be a valid email or phone number"));
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
  if (emailRegex.test(identifier)) {
    req.body.identifier = identifier.toLowerCase().trim();
  } else {
    req.body.identifier = identifier.trim();
  }
  req.body.code = code.trim();

  next();
};