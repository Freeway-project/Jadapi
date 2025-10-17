'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { otpSchema, OTPFormData } from '@/lib/utils/validation';
import { authAPI } from '@/lib/api/auth';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Shield, ArrowLeft, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SigninOtpForm() {
  const router = useRouter();
  const { email, phoneNumber, setLoading, isLoading, setUser, setStep } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const isEmailLogin = !!email;
  const identifier = email || phoneNumber;
  const identifierType = isEmailLogin ? 'email' : 'phone';

  const onSubmit = async (data: OTPFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Verify OTP using real API
      const verifyResult = await authAPI.verifyOTP({
        identifier: identifier!,
        code: data.otp,
        type: 'login'
      });

      if (!verifyResult?.verified) {
        throw new Error('OTP verification failed');
      }

      // Fetch user data by identifier (email or phone)
      // For now, we'll search by the identifier to find the user
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api'}/users/search?identifier=${encodeURIComponent(identifier!)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const { user } = await userResponse.json();

      if (!user) {
        throw new Error('User not found');
      }

      // Set user data in store with all relevant details
      setUser({
        id: user._id || user.id,
        uuid: user.uuid,
        email: user.email || user.auth?.email,
        phoneNumber: user.phone || user.phoneNumber,
        name: user.profile?.name || user.name || 'User',
        accountType: user.accountType || 'individual',
        userType: user.accountType || 'individual',
        profile: user.profile,
        businessProfile: user.businessProfile,
        roles: user.roles,
        status: user.status,
        auth: user.auth,
        lastLogin: new Date().toISOString()
      });

      toast.success('Successfully signed in!');

      // Redirect to search page
      router.push('/search');
    } catch (error) {
      console.error('OTP verification failed:', error);
      toast.error(error instanceof Error ? error.message : 'OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.requestOTP({
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        type: 'login',
        deliveryMethod: isEmailLogin ? 'email' : 'sms'
      });
      toast.success(`OTP resent to your ${identifierType}!`);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const handleBack = () => {
    setStep('signin');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-white to-slate-50 flex items-center">
      <div className="w-full px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-[28rem] rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-md">
          {/* Header */}
          <div className="text-center space-y-3 mb-3 sm:mb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Verify Your Identity
            </h1>
            <p className="text-[0.95rem] sm:text-base text-slate-600">
              Enter the verification code sent to your {identifierType}
            </p>
          </div>

          {/* Identifier Display */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 rounded-2xl border-2 border-blue-100 bg-blue-50 p-3 sm:p-4 mb-5 sm:mb-6">
            {isEmailLogin ? (
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
            ) : (
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
            )}
            <span className="font-semibold text-slate-900 text-[0.95rem] sm:text-base truncate">{identifier}</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-base sm:text-[1rem] font-semibold text-slate-900">
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                disabled={isSubmitting || isLoading}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-4 sm:py-5 text-center text-2xl sm:text-3xl font-mono tracking-[0.5em] text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                {...register('otp')}
                aria-invalid={!!errors.otp}
              />

              {/* Error / Resend */}
              <div className="min-h-[1.25rem]">
                {errors.otp ? (
                  <div className="flex items-center gap-2 text-[0.92rem] font-medium text-rose-600">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[0.8rem] font-bold">
                      !
                    </span>
                    {errors.otp.message}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleResendOTP}
                    className="h-auto p-0 text-[0.92rem] font-medium text-blue-600 hover:text-blue-700"
                  >
                    Didn&apos;t receive the code? Resend
                  </Button>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="group w-full rounded-2xl bg-blue-600 py-3.5 sm:py-4 text-[1.05rem] font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform duration-200 hover:scale-[1.01] hover:bg-blue-700 disabled:opacity-60"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing you in…</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </Button>
          </form>

          {/* Back Button */}
          <div className="mt-4 sm:mt-5 text-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-[0.98rem] text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-[0.92rem] text-slate-500">
            <p className="leading-relaxed">
              Having trouble? Contact our{' '}
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-700 cursor-pointer">
                support team
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}