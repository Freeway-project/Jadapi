'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../lib/stores/authStore';
import { IndividualSignupFormData } from '../../lib/utils/validation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Mail, Phone, ArrowLeft } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';
import toast from 'react-hot-toast';

export default function IndividualSignupForm() {
  const { email: storeEmail, phoneNumber: storePhone, setLoading, isLoading, setUser, setStep } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IndividualSignupFormData>({
    defaultValues: {
      name: '',
      address: '',
      acceptTerms: false,
    },
  });

  const watchedAddress = watch('address');
  const watchedName = watch('name');
  // Complete Signup
  const onSubmit = async (data: IndividualSignupFormData) => {
    console.log('🔵 [IndividualSignup] Form submitted with data:', data);
    console.log('🔵 [IndividualSignup] Store values - email:', storeEmail, 'phone:', storePhone);
    
    setIsSubmitting(true);
    setLoading(true);

    try {
      // Validation
      if (!storeEmail && !storePhone) {
        const msg = 'Email or phone number is required';
        console.error('❌', msg);
        toast.error(msg);
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (!data.name || data.name.trim().length < 2) {
        const msg = 'Full name is required (minimum 2 characters)';
        console.error('❌', msg);
        toast.error(msg);
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (!data.address || data.address.trim().length < 10) {
        const msg = 'Address is required (minimum 10 characters)';
        console.error('❌', msg);
        toast.error(msg);
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      if (!data.acceptTerms) {
        const msg = 'You must accept the Terms and Conditions';
        console.error('❌', msg);
        toast.error(msg);
        setIsSubmitting(false);
        setLoading(false);
        return;
      }

      console.log('✅ All validations passed');
      toast.loading('Creating account...');

      const { authAPI, tokenManager } = await import('../../lib/api/auth');

      // Create account with verified email and phone from EmailStep
      const signupData = {
        accountType: 'individual' as const,
        email: storeEmail || undefined,
        phone: storePhone || undefined,
        name: data.name.trim(),
        address: data.address.trim(),
      };

      console.log('📤 [IndividualSignup] Sending signup data:', signupData);

      const response = await authAPI.signup(signupData);

      console.log('✅ [IndividualSignup] Signup response:', response);

      if (response?.token) {
        tokenManager.setToken(response.token);
      }

      const user = response?.user || response;
      console.log('✅ User object:', user);

      setUser(user);
      setStep('signin');
      toast.success('Account created successfully! Please sign in. 🎉');
    } catch (error: any) {
      console.error('❌ Signup failed with error:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to create account. Please try again.';
      console.error('Error details:', {
        message: errorMsg,
        status: error?.response?.status,
        data: error?.response?.data,
        fullError: error
      });
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">✓</div>
          <div className="w-8 sm:w-12 h-0.5 bg-blue-600"></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">✓</div>
          <div className="w-8 sm:w-12 h-0.5 bg-blue-600"></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">3</div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">Complete Your Profile</h2>
        <p className="text-gray-600 text-sm sm:text-base">Enter your name and address to finish creating your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Display Email (Non-editable) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Email Address</span>
          </Label>
          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium flex items-center">
            {storeEmail || 'Not provided'}
          </div>
        </div>

        {/* Display Phone (Non-editable) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
            <Phone className="w-4 h-4 text-green-600" />
            <span>Phone Number</span>
          </Label>
          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium">
            {storePhone}
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-black">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            disabled={isSubmitting || isLoading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-black">Address *</Label>
          <AddressAutocomplete
            value={watchedAddress || ''}
            onChange={(value) => setValue('address', value)}
            label=""
            placeholder="Enter your address"
            error={errors.address?.message}
            disabled={isSubmitting || isLoading}
          />
        </div>

        {/* Terms */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <input
              id="acceptTerms"
              type="checkbox"
              disabled={isSubmitting || isLoading}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Terms and Conditions
              </a>
              {' '}and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating your account...</span>
            </div>
          ) : (
            'Create Individual Account'
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          className="w-full text-gray-600 hover:text-gray-800 py-3 rounded-xl transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Verification
        </Button>
      </form>
    </div>
  );
}
