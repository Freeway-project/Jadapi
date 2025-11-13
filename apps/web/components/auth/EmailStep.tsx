'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../lib/stores/authStore';
import { emailPhoneSchema, EmailPhoneFormData } from '../../lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ArrowLeft, User, Building2, Mail, Phone } from 'lucide-react';
import { BaseAnimation } from '../animations';
import toast from 'react-hot-toast';
import { UserType } from '../../lib/types/auth';

export default function EmailStep() {
  const { userType, setUserType, setEmail, setPhoneNumber, setStep, setLoading, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [contactData, setContactData] = useState<{ email?: string; phoneNumber: string }>({ email: '', phoneNumber: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailPhoneFormData>({
    resolver: zodResolver(emailPhoneSchema),
  });

  // Step 1: Send OTP
  const onSubmit = async (data: EmailPhoneFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      const { authAPI } = await import('../../lib/api/auth');

      // Check if account already exists BEFORE sending OTPs
      const existingAccount = await authAPI.checkAccountExists({
        email: data.email,
        phoneNumber: data.phoneNumber,
      });

      if (existingAccount.exists) {
        const messages = [];
        if (existingAccount.details.email) {
          messages.push('Email already registered');
        }
        if (existingAccount.details.phone) {
          messages.push('Phone number already registered');
        }
        throw new Error(messages.join(' and ') + '. Please sign in instead.');
      }

      // Always send to phone
      await authAPI.requestPhoneOTP({
        phoneNumber: data.phoneNumber,
        type: 'signup' as const,
      });

      // If email is provided, also send to email
      if (data.email) {
        await authAPI.requestEmailOTP({
          email: data.email,
          type: 'signup' as const,
        });
      }

      toast.success(
        data.email
          ? 'Verification codes sent to phone and email!'
          : 'Verification code sent to phone!'
      );

      // Store contact data and show OTP fields
      setContactData({ email: data.email, phoneNumber: data.phoneNumber });
      setOtpSent(true);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and move to next step
  const handleVerifyOTP = async () => {
    if (!phoneOtp) {
      toast.error('Phone verification code is required');
      return;
    }

    if (contactData.email && !emailOtp) {
      toast.error('Email verification code is required');
      return;
    }

    try {
      setIsVerifying(true);
      setLoading(true);
      const { authAPI } = await import('../../lib/api/auth');

      // Verify phone OTP (always required)

      //   if (contactData.email && emailOtp) {
      //   await authAPI.verifyOTP({
      //     identifier: contactData.email,
      //     code: emailOtp,
      //     type: 'signup'
      //   });
      // }
      await authAPI.verifyOTP({
        identifier: contactData.phoneNumber,
        code: phoneOtp,
        type: 'signup'
      });

      // Verify email OTP if email provided
      if (contactData.email && emailOtp) {
        await authAPI.verifyOTP({
          identifier: contactData.email,
          code: emailOtp,
          type: 'signup'
        });
      }

      toast.success('Verification successful!');

      // Store in auth store and move to the appropriate signup step
      setEmail(contactData.email || '');
      setPhoneNumber(contactData.phoneNumber);
      
      if (userType === 'individual') {
        setStep('individualSignup');
      } else if (userType === 'business') {
        setStep('businessSignup');
      } else {
        // Fallback to verification step if userType is not set
        setStep('verification');
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      toast.error(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async (method: 'email' | 'sms') => {
    try {
      const { authAPI } = await import('../../lib/api/auth');

      if (method === 'email' && contactData.email) {
        await authAPI.requestEmailOTP({
          email: contactData.email,
          type: 'signup' as const,
        });
        toast.success('Email verification code resent!');
      } else if (method === 'sms') {
        await authAPI.requestPhoneOTP({
          phoneNumber: contactData.phoneNumber,
          type: 'signup' as const,
        });
        toast.success('SMS verification code resent!');
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend code. Please try again.');
    }
  };

  const handleBack = () => {
    if (otpSent) {
      setOtpSent(false);
      setEmailOtp('');
      setPhoneOtp('');
    } else {
      setStep('userType');
    }
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
        <h1 className="text-2xl sm:text-4xl font-bold text-black">
          {otpSent ? 'Enter Verification Codes' : 'Enter Your Details'}
        </h1>
        <p className="text-gray-600 text-sm sm:text-lg leading-relaxed px-2">
          {otpSent
            ? 'Enter the verification codes sent to your contact details'
            : userType === 'individual'
            ? "Enter your contact details. We'll send you verification codes to confirm your identity."
            : "We'll send you a verification code via email and SMS"
          }
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
        {!otpSent ? (
          // Step 1: Contact Information Form
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-7">
            {/* Email field */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="email" className="text-sm sm:text-lg font-semibold text-black block mb-3">
                {userType === 'business' ? 'Business Email Address' : 'Email Address'}
                {userType === 'individual' && <span className="text-sm text-gray-500 font-normal ml-2">(Optional)</span>}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={userType === 'business' ? 'Enter your business email' : 'Enter your email'}
                disabled={isSubmitting || isLoading}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number field */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="phoneNumber" className="text-sm sm:text-lg font-semibold text-black block mb-3">
                {userType === 'business' ? 'Business Phone Number' : 'Phone Number'}
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
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
              {errors.phoneNumber && (
                <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
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
        ) : (
          // Step 2: OTP Verification
          <div className="space-y-5">
            {/* Show disabled contact info */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
              {contactData.email && (
                <div className="text-sm">
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="font-medium text-black">{contactData.email}</span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-gray-600">Phone:</span>{' '}
                <span className="font-medium text-black">{contactData.phoneNumber}</span>
              </div>
            </div>

            {/* Email OTP if email provided */}
            {contactData.email && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <Label htmlFor="emailOtp" className="text-sm font-medium text-black">Email verification code</Label>
                </div>
                <Input
                  id="emailOtp"
                  type="text"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isVerifying || isLoading}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl bg-white text-black text-center text-lg font-mono tracking-widest placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => handleResendOTP('email')}
                  className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700"
                >
                  Resend email code
                </Button>
              </div>
            )}

            {/* Phone OTP */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-green-600" />
                <Label htmlFor="phoneOtp" className="text-sm font-medium text-black">Phone verification code</Label>
              </div>
              <Input
                id="phoneOtp"
                type="text"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                disabled={isVerifying || isLoading}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-xl bg-white text-black text-center text-lg font-mono tracking-widest placeholder-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => handleResendOTP('sms')}
                className="p-0 h-auto text-sm text-green-600 hover:text-green-700"
              >
                Resend SMS code
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleVerifyOTP}
              disabled={!phoneOtp || (contactData.email && !emailOtp) || isVerifying || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-5 px-4 sm:px-6 text-sm sm:text-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-full text-gray-600 hover:text-gray-800 py-3 sm:py-4 rounded-xl transition-colors duration-200 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {otpSent ? 'Back to Contact Details' : 'Back to Account Type'}
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
      {(isSubmitting || isVerifying) && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="text-center space-y-4">
            <BaseAnimation animationFile="global-delivery.json" width={120} height={120} className="mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {isSubmitting ? 'Sending verification code...' : 'Verifying code...'}
              </h3>
              <p className="text-gray-600">Please wait while we process your request</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
