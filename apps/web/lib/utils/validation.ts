import { z } from 'zod';

export const phoneRegex = /^[0-9]{10}$/;

// Vancouver address validation
const isVancouverAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;

  const addressLower = address.toLowerCase();
  const vancouverIndicators = [
    'vancouver', 'bc', 'british columbia',
    'v5k', 'v5l', 'v5m', 'v5n', 'v5p', 'v5r', 'v5s', 'v5t', 'v5v', 'v5w', 'v5x', 'v5y', 'v5z',
    'v6a', 'v6b', 'v6c', 'v6e', 'v6g', 'v6h', 'v6j', 'v6k', 'v6l', 'v6m', 'v6n', 'v6p', 'v6r', 'v6s', 'v6t', 'v6v', 'v6w', 'v6x', 'v6y', 'v6z'
  ];

  return vancouverIndicators.some(indicator => addressLower.includes(indicator));
};

const vancouverAddressSchema = z.string()
  .min(10, 'Please enter a complete address')
  .refine(isVancouverAddress, {
    message: 'Address must be in Surrey or Langley, BC. We currently only serve the Surrey and Langley area.'
  });

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
  email: z.string().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(10, 'Address is required'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export const businessSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().regex(phoneRegex, 'Please enter a valid phone number'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').refine(val => val.trim().length >= 2, {
    message: 'Business name is required and must be at least 2 characters',
  }),
  address: vancouverAddressSchema.refine(val => val && val.trim().length >= 10, {
    message: 'Address is required',
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export type EmailPhoneFormData = z.infer<typeof emailPhoneSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type IndividualSignupFormData = z.infer<typeof individualSignupSchema>;
export type BusinessSignupFormData = z.infer<typeof businessSignupSchema>;