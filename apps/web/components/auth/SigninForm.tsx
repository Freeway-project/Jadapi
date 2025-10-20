'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../lib/stores/authStore';
import { signinSchema, SigninFormData } from '../../lib/utils/validation';
import { authAPI } from '../../lib/api/auth';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SigninForm() {
  const { setEmail, setPhoneNumber, setStep, setLoading, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SigninFormData>({ resolver: zodResolver(signinSchema) });

  const identifier = watch('identifier');

  // Simple email/phone detection (display-only)
  const isEmail = !!identifier && identifier.includes('@');
  const isPhone = !!identifier && /^[\d\s\-\(\)\+]+$/.test(identifier);

  const onSubmit = async (data: SigninFormData) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      const isEmailInput = data.identifier.includes('@');

      await authAPI.requestOTP({
        email: isEmailInput ? data.identifier : undefined,
        phoneNumber: isEmailInput ? undefined : data.identifier,
        type: 'login',
        deliveryMethod: isEmailInput ? 'email' : 'sms',
      });

      if (isEmailInput) {
        setEmail(data.identifier);
        setPhoneNumber('');
      } else {
        setPhoneNumber(data.identifier);
        setEmail('');
      }

      setStep('signinOtp');
      toast.success(`Verification code sent to your ${isEmailInput ? 'email' : 'phone'}!`);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleSignupLink = () => {
    const { setAuthMode, setStep, reset } = useAuthStore.getState();
    reset();
    setAuthMode('signup');
    setStep('userType');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-white to-slate-50 flex items-center">
      <div className="w-full px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-[28rem] rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-md">
          {/* Header */}
          <div className="text-center space-y-3 mb-3 sm:mb-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <ArrowRight className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="text-[0.95rem] sm:text-base text-slate-600">
              Sign in with your email or phone number
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-base sm:text-[1rem] font-semibold text-slate-900">
                Email or Phone Number
              </Label>
              <div className="relative">
                <Input
                  id="identifier"
                  type="text"
                  inputMode={isEmail ? 'email' : 'tel'}
                  autoComplete={isEmail ? 'email' : 'tel'}
                  placeholder={isEmail ? 'you@example.com' : '+1 604 555 1234'}
                  disabled={isSubmitting || isLoading}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-[1rem] sm:text-[1rem] text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  {...register('identifier')}
                  aria-invalid={!!errors.identifier}
                />
                {identifier && !errors.identifier && (
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-90">
                    {isEmail ? (
                      <Mail className="w-5 h-5 text-blue-600" />
                    ) : isPhone ? (
                      <Phone className="w-5 h-5 text-emerald-600" />
                    ) : null}
                  </div>
                )}
              </div>

              {/* Error / Help */}
              <div className="min-h-[1.25rem]">
                {errors.identifier ? (
                  <div className="flex items-center gap-2 text-[0.92rem] font-medium text-rose-600">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[0.8rem] font-bold">
                      !
                    </span>
                    {errors.identifier.message}
                  </div>
                ) : identifier ? (
                  <p className="text-[0.92rem] text-slate-500">
                    {isEmail
                      ? "We'll send a verification code to your email"
                      : isPhone
                      ? "We'll send a verification code via SMS"
                      : 'Enter a valid email or phone number'}
                  </p>
                ) : (
                  <p className="text-[0.92rem] text-slate-500">
                    Use your email, or a mobile number with country code.
                  </p>
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
                  <span>Sending code…</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              )}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-4 sm:mt-5 text-center">
            <Button
              variant="ghost"
              onClick={handleSignupLink}
              className="text-[0.98rem] text-slate-600 hover:text-slate-900"
            >
              Don&apos;t have an account?
              <span className="ml-1 text-blue-600 hover:text-blue-700">Sign up</span>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-[0.92rem] text-slate-500">
            <p className="leading-relaxed">
              By signing in, you agree to our{' '}
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-700 cursor-pointer">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-700 cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
