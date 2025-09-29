import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { validateVancouverAddress } from "../utils/addressValidation";

export const validateSignup = (req: Request, _res: Response, next: NextFunction) => {
  const { accountType, email, phone, displayName, legalName, address } = req.body;

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

  // Phone validation (flexible format)
  if (phone) {
    if (typeof phone !== "string") {
      return next(new ApiError(400, "Phone must be a string"));
    }

    // Remove all non-digits to check if it's a valid phone number
    const digitsOnly = phone.replace(/\D/g, '');

    // Check if it has at least 10 digits (minimum for most phone numbers)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return next(new ApiError(400, "Phone number must have 10-15 digits"));
    }
  }

  // Business account specific validation
  if (accountType === "business") {
    if (!legalName || typeof legalName !== "string" || legalName.trim().length === 0) {
      return next(new ApiError(400, "Legal name is required for business accounts"));
    }
  }

  // Address validation
  if (address) {
    if (typeof address !== "string") {
      return next(new ApiError(400, "Address must be a string"));
    }

    const addressValidation = validateVancouverAddress(address);
    if (!addressValidation.isValid) {
      return next(new ApiError(400, addressValidation.message || "Invalid address"));
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
  if (address) {
    req.body.address = address.trim();
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

  // For business users, allow separate OTP requests for email and phone
  // No additional validation needed here as we handle separate requests

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

    // Remove all non-digits to check if it's a valid phone number
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // Check if it has at least 10 digits (minimum for most phone numbers)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return next(new ApiError(400, "Phone number must have 10-15 digits"));
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
  const isEmail = emailRegex.test(identifier);

  if (!isEmail) {
    // Check if it's a valid phone number
    const digitsOnly = identifier.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return next(new ApiError(400, "Identifier must be a valid email or phone number with 10-15 digits"));
    }
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