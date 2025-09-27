'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { emailSchema, EmailFormData } from '@/lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailStep() {
  const { userType, setEmail, setStep, setLoading, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    setLoading(true);

    // Simulate processing delay
    setTimeout(() => {
      setEmail(data.email);
      setStep('verification');
      toast.success('Proceeding to verification!');
      setIsSubmitting(false);
      setLoading(false);
    }, 800);
  };

  const handleBack = () => {
    setStep('userType');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 bg-white">
      {/* Progress indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">✓</div>
          <div className="w-12 h-0.5 bg-blue-600"></div>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-sm font-medium">3</div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
            {userType === 'individual' ? (
              <User className="w-6 h-6 text-white" />
            ) : (
              <Building2 className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-black">
              {userType === 'individual' ? 'Individual' : 'Business'} Account
            </h2>
            <p className="text-gray-600">
              Creating your {userType} account
            </p>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-black">Enter Your Email</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          We'll send you a verification code to confirm your email address
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-medium text-black">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                disabled={isSubmitting || isLoading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                {...register('email')}
              />
              {!errors.email && !isSubmitting && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {errors.email && (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p className="text-sm">{errors.email.message}</p>
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
          className="w-full text-gray-600 hover:text-gray-800 py-3 rounded-xl transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account Type
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
        <p className="leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}