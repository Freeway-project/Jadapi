'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../lib/stores/authStore';
import { individualSignupSchema, IndividualSignupFormData } from '../../lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Shield } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import toast from 'react-hot-toast';

export default function IndividualSignupForm() {
  const { email, phoneNumber, setLoading, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IndividualSignupFormData>({
    resolver: zodResolver(individualSignupSchema),
    defaultValues: {
      email: email || undefined,
      phoneNumber,
      name: '',
      address: '',
      otp: '',
      acceptTerms: false,
    },
  });

  const watchedAddress = watch('address');

  const { setUser, setStep } = useAuthStore();

  const onSubmit = async (data: IndividualSignupFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Import authAPI and tokenManager dynamically to avoid SSR issues
      const { authAPI, tokenManager } = await import('../../lib/api/auth');

      // Step 1: Verify OTP
      const identifier = data.email || data.phoneNumber;
      await authAPI.verifyOTP({
        identifier,
        code: data.otp,
        type: 'signup'
      });

      // Step 2: Create account
      const signupData = {
        accountType: 'individual' as const,
        email: data.email,
        phone: data.phoneNumber,
        name: data.name,
        address: data.address,
      };

      const response = await authAPI.signup(signupData);

      // Store JWT token if provided
      if (response?.token) {
        tokenManager.setToken(response.token);
      }

      // Set user data in store
      const user = response?.user || response;
      setUser(user);
      setStep('success');
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Signup failed:', error);

      if (error.message?.includes('OTP')) {
        toast.error('Invalid verification code. Please check and try again.');
      } else if (error.message?.includes('already registered')) {
        toast.error('An account with this email or phone already exists.');
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async (method: 'email' | 'sms' = 'sms') => {
    try {
      const { authAPI } = await import('../../lib/api/auth');

      const otpData = {
        email: method === 'email' ? email : undefined,
        phoneNumber: method === 'sms' ? phoneNumber : undefined,
        type: 'signup' as const,
        deliveryMethod: method,
      };

      await authAPI.requestOTP(otpData);
      toast.success(`Verification code resent via ${method === 'email' ? 'email' : 'SMS'}!`);
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* OTP Verification */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <Label htmlFor="otp" className="text-base font-medium text-black">
              Enter verification code sent to your phone{email ? ' or email' : ''}
            </Label>
          </div>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            maxLength={6}
            disabled={isSubmitting || isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black text-center text-lg font-mono tracking-widest placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
            {...register('otp')}
          />
          {errors.otp && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs font-bold">!</span>
              </div>
              <p className="text-sm">{errors.otp.message}</p>
            </div>
          )}
          <div className="flex space-x-4">
            {email && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => handleResendOTP('email')}
                className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend to email
              </Button>
            )}
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => handleResendOTP('sms')}
              className="p-0 h-auto text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Resend to phone
            </Button>
          </div>
        </div>

        {/* Email (prefilled and readonly) - only show if email exists */}
        {email && (
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-medium text-black">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
              {...register('email')}
            />
          </div>
        )}

        {/* Phone Number (prefilled and readonly) */}
        <div className="space-y-3">
          <Label htmlFor="phoneNumber" className="text-base font-medium text-black">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            disabled
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
            {...register('phoneNumber')}
          />
        </div>

        {/* Name field */}
        <div className="space-y-3">
          <Label htmlFor="name" className="text-base font-medium text-black">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            disabled={isSubmitting || isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
            {...register('name')}
          />
          {errors.name && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs font-bold">!</span>
              </div>
              <p className="text-sm">{errors.name.message}</p>
            </div>
          )}
        </div>

        {/* Address with Google Maps Autocomplete */}
        <AddressAutocomplete
          value={watchedAddress || ''}
          onChange={(value) => setValue('address', value)}
          label="Address"
          placeholder="Enter your address"
          error={errors.address?.message}
          disabled={isSubmitting || isLoading}
        />

        {/* Terms and Conditions Checkbox */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <input
              id="acceptTerms"
              type="checkbox"
              disabled={isSubmitting || isLoading}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Terms and Conditions
              </a>
              {' '}and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <div className="flex items-center space-x-2 text-red-600">
              <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xs font-bold">!</span>
              </div>
              <p className="text-sm">{errors.acceptTerms.message}</p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating your account...</span>
            </div>
          ) : (
            'Create Individual Account'
          )}
        </Button>
      </form>
    </div>
  );
}