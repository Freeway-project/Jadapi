'use client';

import { useState } from 'react';
import { UserType } from '@/lib/types/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@workspace/ui/components/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { User, Building2 } from 'lucide-react';

export default function UserTypeSelector() {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const { setUserType, setStep, setAuthMode } = useAuthStore();

  const handleContinue = () => {
    if (selectedType) {
      setUserType(selectedType);
      setStep('email');
    }
  };

  const handleSignin = () => {
    setAuthMode('signin');
    setStep('signin');
  };

  const userTypes = [
    {
      type: 'individual' as UserType,
      title: 'Individual',
      description: 'Personal account for individual users',
      icon: User,
    },
    {
      type: 'business' as UserType,
      title: 'Business',
      description: 'Business account for companies and organizations',
      icon: Building2,
    },
  ];

  return (
    <div className="w-full space-y-8 bg-white">
      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-sm font-medium">2</div>
          <div className="w-12 h-0.5 bg-gray-200"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-sm font-medium">3</div>
        </div>
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-black">Choose Account Type</h1>
        <p className="text-gray-600 text-lg">
          Select the type of account you want to create
        </p>
      </div>

      <div className="space-y-4">
        {userTypes.map(({ type, title, description, icon: Icon }) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all duration-300 border-2 rounded-xl ${
              selectedType === type
                ? 'border-blue-600 bg-blue-50 shadow-lg transform scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:transform hover:scale-[1.01]'
            }`}
            onClick={() => setSelectedType(type)}
          >
            <CardHeader className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  selectedType === type
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-black mb-1">{title}</CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">{description}</CardDescription>
                </div>
                <div className={`transition-all duration-300 ${
                  selectedType === type ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                }`}>
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="pt-4 space-y-4">
        <Button
          onClick={handleContinue}
          disabled={!selectedType}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          size="lg"
        >
          Continue  Verification
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleSignin}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Already have an account? <span className="text-blue-600 hover:text-blue-700 ml-1">Sign in</span>
          </Button>
        </div>
      </div>
    </div>
  );
}