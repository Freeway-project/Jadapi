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
      await authAPI.verifyOTP({
        identifier: identifier!,
        code: data.otp,
        type: 'login'
      });

      // Mock user data for now - in real implementation, this would come from API after OTP verification
      const userData = {
        id: Math.random().toString(36).substring(2, 11),
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        name: 'User',
        userType: 'individual',
        lastLogin: new Date().toISOString()
      };

      setUser(userData);
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
    <div className="w-full max-w-md mx-auto space-y-8 bg-white">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="p-4 bg-blue-600 rounded-xl shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-black">Verify Your Identity</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Enter the verification code sent to your {identifierType}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          {isEmailLogin ? (
            <Mail className="w-5 h-5 text-blue-600" />
          ) : (
            <Phone className="w-5 h-5 text-blue-600" />
          )}
          <span className="text-gray-700 font-medium">{identifier}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="otp" className="text-base font-medium text-black">
              Verification Code
            </Label>
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
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResendOTP}
              className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Didn't receive the code? Resend
            </Button>
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
                <span>Signing you in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-full text-gray-600 hover:text-gray-800 py-3 rounded-xl transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
        <p className="leading-relaxed">
          Having trouble? Contact our{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">support team</span>
        </p>
      </div>
    </div>
  );
}