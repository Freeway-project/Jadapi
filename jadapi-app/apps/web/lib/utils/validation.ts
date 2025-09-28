import { z } from 'zod';

export const phoneRegex = /^(\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

export const emailPhoneSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
});

export const signinSchema = z.object({
  identifier: z.string().min(1, 'Please enter your email or phone number'),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const individualSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a complete address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const businessSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a complete business address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export type EmailPhoneFormData = z.infer<typeof emailPhoneSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type IndividualSignupFormData = z.infer<typeof individualSignupSchema>;
export type BusinessSignupFormData = z.infer<typeof businessSignupSchema>;