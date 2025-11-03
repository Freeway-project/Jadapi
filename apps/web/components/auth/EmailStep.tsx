'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../lib/stores/authStore';
import { emailPhoneSchema, EmailPhoneFormData } from '../../lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import { BaseAnimation } from '../animations';
import toast from 'react-hot-toast';

export default function EmailStep() {
  const { userType, setEmail, setPhoneNumber, setStep, setLoading, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailPhoneFormData>({
    resolver: zodResolver(emailPhoneSchema),
  });

  const onSubmit = async (data: EmailPhoneFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Import authAPI dynamically to avoid SSR issues
      const { authAPI } = await import('../../lib/api/auth');

      // For business users, send separate different OTPs to email and phone
      if (userType === 'business') {
        // Send separate OTP to email
        if (data.email) {
          await authAPI.requestOTP({
            email: data.email,
            type: 'signup' as const,
            deliveryMethod: 'email',
            userType: 'business',
          });
        }

        // Send separate different OTP to phone
        if (data.phoneNumber) {
          await authAPI.requestOTP({
            phoneNumber: data.phoneNumber,
            type: 'signup' as const,
            deliveryMethod: 'sms',
            userType: 'business',
          });
        }
      } else {
        // Individual users - send OTP to phone (and email if provided)
        const deliveryMethod = data.email ? 'both' : 'sms';
        await authAPI.requestOTP({
          email: data.email,
          phoneNumber: data.phoneNumber,
          type: 'signup' as const,
          deliveryMethod,
          userType: 'individual',
        });
      }

      // Store email and phone in state
      setEmail(data.email || '');
      setPhoneNumber(data.phoneNumber);
      setStep('verification');

      let deliveryText = '';
      if (userType === 'business') {
        deliveryText = 'Separate verification codes sent to your email and phone!';
      } else {
        deliveryText = data.email
          ? 'Verification codes sent to your email and phone!'
          : 'Verification code sent via SMS!';
      }
      toast.success(deliveryText);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('userType');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm relative">
      {/* Progress indicator */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">✓</div>
          <div className="w-8 sm:w-12 h-0.5 bg-blue-600"></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">2</div>
          <div className="w-8 sm:w-12 h-0.5 bg-gray-200"></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs sm:text-sm font-medium">3</div>
        </div>
      </div>

      <div className="text-center space-y-2 sm:space-y-3">
        <div className="flex items-center justify-center space-x-3 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-blue-600 rounded-xl shadow-lg">
            {userType === 'individual' ? (
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            )}
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-black">Enter Your Details</h1>
        <p className="text-gray-600 text-sm sm:text-lg leading-relaxed px-2">
          {userType === 'individual'
            ? "Enter your contact details. We'll send you verification codes to confirm your identity."
            : "We'll send you a verification code via email and SMS"
          }
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-7">
          {/* Email field - for all users */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="email" className="text-sm sm:text-lg font-semibold text-black block mb-3">
              {userType === 'business' ? 'Business Email Address' : 'Email Address'}
              {userType === 'individual' && <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>}
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder={userType === 'business' ? 'Enter your business email address' : 'Enter your email address'}
                disabled={isSubmitting || isLoading}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                {...register('email')}
              />
              {!errors.email && !isSubmitting && (
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {errors.email && (
              <div className="flex items-center space-x-2 text-red-600 pt-1">
                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p className="text-sm">{errors.email.message}</p>
              </div>
            )}
            {userType === 'individual' && !errors.email && (
              <p className="text-xs sm:text-sm text-gray-500">
                Adding an email helps with account recovery
              </p>
            )}
          </div>

          {/* Phone Number field */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="phoneNumber" className="text-sm sm:text-lg font-semibold text-black block mb-3">
              {userType === 'business' ? 'Business Phone Number' : 'Phone Number'}
            </Label>
            <div className="relative">
              <Input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                maxLength={10}
                placeholder="6041234567"
                disabled={isSubmitting || isLoading}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                {...register('phoneNumber', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  }
                })}
              />
              {!errors.phoneNumber && !isSubmitting && (
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {errors.phoneNumber && (
              <div className="flex items-center space-x-2 text-red-600 pt-1">
                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p className="text-sm">{errors.phoneNumber.message}</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-5 px-4 sm:px-6 text-sm sm:text-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending verification code...</span>
              </div>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-full text-gray-600 hover:text-gray-800 py-3 sm:py-4 rounded-xl transition-colors duration-200 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account Type
        </Button>
      </div>

      <div className="text-center text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 sm:p-4 rounded-xl">
        <p className="leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Privacy Policy</span>
        </p>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="text-center space-y-4">
            <BaseAnimation animationFile="global-delivery.json" width={120} height={120} className="mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Sending verification code...</h3>
              <p className="text-gray-600">Please wait while we process your request</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}