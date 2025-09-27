'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import IndividualSignupForm from './IndividualSignupForm';
import BusinessSignupForm from './BusinessSignupForm';

export default function VerificationStep() {
  const { userType, setStep } = useAuthStore();

  const handleBack = () => {
    setStep('email');
  };

  const isIndividual = userType === 'individual';

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
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Verify your email and complete your information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              {isIndividual ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Building2 className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {isIndividual ? 'Individual' : 'Business'} Account
              </CardTitle>
              <CardDescription>
                Complete your {isIndividual ? 'personal' : 'business'} information
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isIndividual ? <IndividualSignupForm /> : <BusinessSignupForm />}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}