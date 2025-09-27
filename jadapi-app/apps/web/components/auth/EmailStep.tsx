'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/stores/authStore';
import { authAPI } from '@/lib/api/auth';
import { emailSchema, EmailFormData } from '@/lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ArrowLeft, Mail } from 'lucide-react';
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

    try {
      const response = await authAPI.sendOTP(data.email);

      if (response.success) {
        setEmail(data.email);
        setStep('verification');
        toast.success('OTP sent to your email!');
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('userType');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">Enter Your Email</h1>
          <p className="text-muted-foreground">
            We'll send you an OTP to verify your email
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {userType === 'individual' ? 'Individual' : 'Business'} Account
              </CardTitle>
              <CardDescription>
                Creating {userType} account
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                disabled={isSubmitting || isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}