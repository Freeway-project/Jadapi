'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/stores/authStore';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { User, Building2 } from 'lucide-react';
import { BaseAnimation } from '../animations';

export default function SuccessStep() {
  const router = useRouter();
  const { userType, user, reset } = useAuthStore();

  const handleContinue = () => {
    router.push('/search');
  };

  const handleStartOver = () => {
    reset();
  };

  const isIndividual = userType === 'individual';

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="space-y-4">
        <BaseAnimation animationFile="global-delivery.json" width={160} height={160} className="mx-auto" />
        <div>
          <h1 className="text-2xl font-bold text-black">Account Created Successfully!</h1>
          <p className="text-gray-600 mt-2">
            Welcome to our platform. Your account has been set up and you're ready to get started.
          </p>
        </div>
      </div>

      <Card className="border-2 border-gray-200 bg-white shadow-sm text-left">
        <CardHeader className="pb-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-md">
              {isIndividual ? (
                <User className="w-6 h-6 text-white" />
              ) : (
                <Building2 className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {isIndividual ? 'Individual' : 'Business'} Account
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Account created successfully
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {user?.auth?.email && (
            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-700">Email:</span>
              <p className="text-gray-900 font-medium">{user.auth.email}</p>
            </div>
          )}

          {user?.auth?.phone && (
            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-700">Phone:</span>
              <p className="text-gray-900 font-medium">{user.auth.phone}</p>
            </div>
          )}

          {user?.profile?.name && (
            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-700">
                Name:
              </span>
              <p className="text-gray-900 font-medium">{user.profile.name}</p>
            </div>
          )}

          {user?.businessProfile?.businessName && !isIndividual && (
            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-700">Business Name:</span>
              <p className="text-gray-900 font-medium">{user.businessProfile.businessName}</p>
            </div>
          )}

          {user?.profile?.address && (
            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-700">Address:</span>
              <p className="text-gray-900 font-medium">{user.profile.address}</p>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-700">Account Type:</span>
            <p className="text-gray-900 font-medium capitalize">{user?.accountType || 'Unknown'}</p>
          </div>

          {user?.uuid && (
            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-700">Account ID:</span>
              <p className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded border">{user.uuid}</p>
            </div>
          )}

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs text-gray-400 cursor-pointer">Debug: User Object</summary>
              <pre className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={handleContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-[1.02]"
          size="lg"
        >
          Continue to Search
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