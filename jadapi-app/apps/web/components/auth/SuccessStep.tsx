'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { CheckCircle, User, Building2 } from 'lucide-react';

export default function SuccessStep() {
  const { userType, user, reset } = useAuthStore();

  const handleStartOver = () => {
    reset();
  };

  const isIndividual = userType === 'individual';

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black">Account Created Successfully!</h1>
          <p className="text-gray-600 mt-2">
            Welcome to our platform. Your account has been set up and you're ready to get started.
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 text-left">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              {isIndividual ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg text-black">
                {isIndividual ? 'Individual' : 'Business'} Account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Account created successfully
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Email:</span>
            <p className="text-black">{user?.email}</p>
          </div>

          {isIndividual ? (
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-black">{user?.name}</p>
            </div>
          ) : (
            <div>
              <span className="text-sm font-medium text-gray-500">Business Name:</span>
              <p className="text-black">{user?.businessName}</p>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-gray-500">Address:</span>
            <p className="text-black">{user?.address}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500">Account ID:</span>
            <p className="text-gray-600 font-mono text-sm">{user?.id}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          Continue to Dashboard
        </Button>

        <Button
          variant="outline"
          onClick={handleStartOver}
          className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
          size="lg"
        >
          Create Another Account
        </Button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>
          Check your email for further instructions and account verification details.
        </p>
      </div>
    </div>
  );
}