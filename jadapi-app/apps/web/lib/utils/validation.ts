import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const individualSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a complete address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const businessSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a complete business address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

export type EmailFormData = z.infer<typeof emailSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type IndividualSignupFormData = z.infer<typeof individualSignupSchema>;
export type BusinessSignupFormData = z.infer<typeof businessSignupSchema>;