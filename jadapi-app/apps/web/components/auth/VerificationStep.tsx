'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import IndividualSignupForm from './IndividualSignupForm';
import BusinessSignupForm from './BusinessSignupForm';
import { BaseAnimation } from '../animations';

export default function VerificationStep() {
  const { userType, setStep } = useAuthStore();

  const handleBack = () => {
    setStep('email');
  };

  const isIndividual = userType === 'individual';

  return (
    <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
      {/* Progress indicator */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">✓</div>
          <div className="w-8 sm:w-12 h-0.5 bg-blue-600"></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">✓</div>
          <div className="w-8 sm:w-12 h-0.5 bg-blue-600"></div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">3</div>
        </div>
      </div>

      <div className="text-center space-y-2 sm:space-y-3">
        <div className="flex items-center justify-center space-x-3 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-blue-600 rounded-xl shadow-lg">
            {isIndividual ? (
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            )}
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-black">Complete Your Profile</h1>
        <p className="text-gray-600 text-sm sm:text-lg leading-relaxed px-2">
          Verify your code and fill in your details to create your account
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6 rounded-2xl border border-blue-100">
          {isIndividual ? <IndividualSignupForm /> : <BusinessSignupForm />}
        </div>

        <Button
          variant="ghost"
          onClick={handleBack}
          className="w-full text-gray-600 hover:text-gray-800 py-3 sm:py-4 rounded-xl transition-colors duration-200 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="text-center text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 sm:p-4 rounded-xl">
        <p className="leading-relaxed">
          By creating an account, you agree to our{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-blue-600 hover:text-blue-700 cursor-pointer underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}