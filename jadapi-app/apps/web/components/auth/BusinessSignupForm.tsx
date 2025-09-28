'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { businessSignupSchema, BusinessSignupFormData } from '@/lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Shield } from 'lucide-react';
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
      otp: '',
    },
  });

  const watchedAddress = watch('address');

  const { setUser, setStep } = useAuthStore();

  const onSubmit = async (data: BusinessSignupFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      const userData = {
        id: Math.random().toString(36).substring(2, 11),
        email: data.email,
        phoneNumber: data.phoneNumber,
        businessName: data.businessName,
        address: data.address,
        userType: 'business',
        createdAt: new Date().toISOString()
      };

      setUser(userData);
      setStep('success');
      toast.success('Business account created successfully!');
      setIsSubmitting(false);
      setLoading(false);
    }, 1200);
  };

  const handleResendOTP = async () => {
    toast.success('OTP resent to your email!');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP Verification */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <Label htmlFor="otp" className="text-sm font-medium text-black">Enter verification code sent to your email or phone</Label>
          </div>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            disabled={isSubmitting || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-gray-50 disabled:text-gray-500"
            {...register('otp')}
          />
          {errors.otp && (
            <p className="text-sm text-red-600">{errors.otp.message}</p>
          )}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResendOTP}
              className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700"
            >
              Resend to email
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResendOTP}
              className="p-0 h-auto text-xs text-green-600 hover:text-green-700"
            >
              Resend to phone
            </Button>
          </div>
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