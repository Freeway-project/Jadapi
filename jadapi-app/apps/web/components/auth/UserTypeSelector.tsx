'use client';

import { useState } from 'react';
import { UserType } from '@/lib/types/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@workspace/ui/components/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { User, Building2 } from 'lucide-react';

export default function UserTypeSelector() {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const { setUserType, setStep } = useAuthStore();

  const handleContinue = () => {
    if (selectedType) {
      setUserType(selectedType);
      setStep('email');
    }
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
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold">Choose Account Type</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Select the type of account you want to create
        </p>
      </div>

      <div className="space-y-3">
        {userTypes.map(({ type, title, description, icon: Icon }) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all border-2 hover:border-primary/50 ${
              selectedType === type
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
            onClick={() => setSelectedType(type)}
          >
            <CardHeader className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        disabled={!selectedType}
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );
}