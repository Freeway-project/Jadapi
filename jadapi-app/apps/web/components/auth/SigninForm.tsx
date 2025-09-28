'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { signinSchema, SigninFormData } from '@/lib/utils/validation';
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
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const identifier = watch('identifier');

  // Simple email detection
  const isEmail = identifier && identifier.includes('@');
  const isPhone = identifier && /^[\d\s\-\(\)\+]+$/.test(identifier);

  const onSubmit = async (data: SigninFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    // Determine if it's email or phone
    const isEmailInput = data.identifier.includes('@');

    // Simulate processing delay
    setTimeout(() => {
      if (isEmailInput) {
        setEmail(data.identifier);
        setPhoneNumber('');
      } else {
        setPhoneNumber(data.identifier);
        setEmail('');
      }
      setStep('signinOtp');
      toast.success(`Verification code sent to your ${isEmailInput ? 'email' : 'phone'}!`);
      setIsSubmitting(false);
      setLoading(false);
    }, 800);
  };

  const handleSignupLink = () => {
    const { setAuthMode, setStep, reset } = useAuthStore.getState();
    reset();
    setAuthMode('signup');
    setStep('userType');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 bg-white">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="p-4 bg-blue-600 rounded-xl shadow-lg">
            <ArrowRight className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-black">Welcome Back</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Sign in with your email or phone number
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="identifier" className="text-base font-medium text-black">
              Email or Phone Number
            </Label>
            <div className="relative">
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your email or phone number"
                disabled={isSubmitting || isLoading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                {...register('identifier')}
              />
              {identifier && !errors.identifier && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isEmail ? (
                    <Mail className="w-5 h-5 text-blue-600" />
                  ) : isPhone ? (
                    <Phone className="w-5 h-5 text-green-600" />
                  ) : null}
                </div>
              )}
            </div>
            {errors.identifier && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p className="text-sm">{errors.identifier.message}</p>
              </div>
            )}
            {identifier && !errors.identifier && (
              <p className="text-sm text-gray-500">
                {isEmail ? '📧 We\'ll send a verification code to your email' :
                 isPhone ? '📱 We\'ll send a verification code via SMS' :
                 'Enter a valid email or phone number'}
              </p>
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
                <span>Sending code...</span>
              </div>
            ) : (
              'Continue'
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleSignupLink}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Don't have an account? <span className="text-blue-600 hover:text-blue-700 ml-1">Sign up</span>
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
        <p className="leading-relaxed">
          By signing in, you agree to our{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}