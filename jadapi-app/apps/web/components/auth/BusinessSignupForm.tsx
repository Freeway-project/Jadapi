'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { businessSignupSchema, BusinessSignupFormData } from '@/lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Shield, Mail, Phone } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import toast from 'react-hot-toast';

export default function BusinessSignupForm() {
  const { email, phoneNumber, setLoading, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BusinessSignupFormData>({
    resolver: zodResolver(businessSignupSchema),
    defaultValues: {
      email,
      phoneNumber,
      businessName: '',
      address: '',
      emailOtp: '',
      phoneOtp: '',
    },
  });

  const watchedAddress = watch('address');

  const { setUser, setStep } = useAuthStore();

  const onSubmit = async (data: BusinessSignupFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Import authAPI dynamically to avoid SSR issues
      const { authAPI } = await import('@/lib/api/auth');

      // Step 1: Verify both email and phone OTPs
      await authAPI.verifyOTP({
        identifier: data.email,
        code: data.emailOtp,
        type: 'signup'
      });

      await authAPI.verifyOTP({
        identifier: data.phoneNumber,
        code: data.phoneOtp,
        type: 'signup'
      });

      // Step 2: Create business account
      const signupData = {
        accountType: 'business' as const,
        email: data.email,
        phone: data.phoneNumber,
        displayName: data.businessName,
        legalName: data.businessName, // Use business name as legal name
        address: data.address,
      };

      const user = await authAPI.signup(signupData);

      setUser(user);
      setStep('success');
      toast.success('Business account created successfully!');
    } catch (error: any) {
      console.error('Business signup failed:', error);

      if (error.message?.includes('OTP') || error.message?.includes('verification')) {
        toast.error('Invalid verification code. Please check both email and phone codes and try again.');
      } else if (error.message?.includes('already registered')) {
        toast.error('A business with this email or phone already exists.');
      } else {
        toast.error(error.message || 'Failed to create business account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async (method: 'email' | 'sms' = 'email') => {
    try {
      const { authAPI } = await import('@/lib/api/auth');

      if (method === 'email') {
        await authAPI.requestOTP({
          email: email,
          type: 'signup' as const,
          deliveryMethod: 'email',
          userType: 'business' as const,
        });
        toast.success('Email verification code resent!');
      } else {
        await authAPI.requestOTP({
          phoneNumber: phoneNumber,
          type: 'signup' as const,
          deliveryMethod: 'sms',
          userType: 'business' as const,
        });
        toast.success('SMS verification code resent!');
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email OTP Verification */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <Label htmlFor="emailOtp" className="text-sm font-medium text-black">Email verification code</Label>
          </div>
          <Input
            id="emailOtp"
            type="text"
            placeholder="Enter email OTP"
            maxLength={6}
            disabled={isSubmitting || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-500"
            {...register('emailOtp')}
          />
          {errors.emailOtp && (
            <p className="text-sm text-red-600">{errors.emailOtp.message}</p>
          )}
          <div className="text-xs text-gray-600">
            Code sent to: <span className="font-medium">{email}</span>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => handleResendOTP('email')}
            className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700"
          >
            Resend email code
          </Button>
        </div>

        {/* Phone OTP Verification */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-green-600" />
            <Label htmlFor="phoneOtp" className="text-sm font-medium text-black">Phone verification code</Label>
          </div>
          <Input
            id="phoneOtp"
            type="text"
            placeholder="Enter phone OTP"
            maxLength={6}
            disabled={isSubmitting || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:border-green-600 focus:ring-1 focus:ring-green-600 disabled:bg-gray-50 disabled:text-gray-500"
            {...register('phoneOtp')}
          />
          {errors.phoneOtp && (
            <p className="text-sm text-red-600">{errors.phoneOtp.message}</p>
          )}
          <div className="text-xs text-gray-600">
            Code sent to: <span className="font-medium">{phoneNumber}</span>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => handleResendOTP('sms')}
            className="p-0 h-auto text-xs text-green-600 hover:text-green-700"
          >
            Resend SMS code
          </Button>
        </div>

        {/* Email (prefilled and readonly) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-black">Business Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            {...register('email')}
          />
        </div>

        {/* Phone Number (prefilled and readonly) */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-black">Business Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            {...register('phoneNumber')}
          />
        </div>

        {/* Business Name field */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium text-black">Business Name</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Enter your business name"
            disabled={isSubmitting || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-500"
            {...register('businessName')}
          />
          {errors.businessName && (
            <p className="text-sm text-red-600">{errors.businessName.message}</p>
          )}
        </div>

        {/* Address with Google Maps Autocomplete */}
        <AddressAutocomplete
          value={watchedAddress || ''}
          onChange={(value) => setValue('address', value)}
          label="Business Address"
          placeholder="Enter your business address"
          error={errors.address?.message}
          disabled={isSubmitting || isLoading}
        />

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating your business account...</span>
            </div>
          ) : (
            'Create Business Account'
          )}
        </Button>
      </form>
    </div>
  );
}