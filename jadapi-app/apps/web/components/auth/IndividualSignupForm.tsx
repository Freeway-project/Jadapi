'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { authAPI } from '@/lib/api/auth';
import { individualSignupSchema, IndividualSignupFormData } from '@/lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Shield } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import toast from 'react-hot-toast';

export default function IndividualSignupForm() {
  const { email, setLoading, isLoading } = useAuthStore();
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
      email,
      name: '',
      address: '',
      otp: '',
    },
  });

  const watchedAddress = watch('address');

  const onSubmit = async (data: IndividualSignupFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      const signupData = {
        ...data,
        userType: 'individual' as const,
      };

      const response = await authAPI.signupIndividual(signupData);

      if (response.success) {
        toast.success('Account created successfully!');
        console.log('User created:', response.user);
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
      } else {
        toast.error('Failed to create account');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authAPI.sendOTP(email);
      if (response.success) {
        toast.success('OTP resent to your email!');
      } else {
        toast.error('Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* OTP Verification */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-primary" />
          <Label htmlFor="otp">Enter OTP sent to {email}</Label>
        </div>
        <Input
          id="otp"
          type="text"
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          disabled={isSubmitting || isLoading}
          {...register('otp')}
        />
        {errors.otp && (
          <p className="text-sm text-destructive">{errors.otp.message}</p>
        )}
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleResendOTP}
          className="p-0 h-auto text-xs"
        >
          Didn't receive OTP? Resend
        </Button>
      </div>

      {/* Email (prefilled and readonly) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-muted"
          {...register('email')}
        />
      </div>

      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          disabled={isSubmitting || isLoading}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
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

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}