'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import UserTypeSelector from './UserTypeSelector';
import EmailStep from './EmailStep';
import VerificationStep from './VerificationStep';
import SuccessStep from './SuccessStep';
import SigninForm from './SigninForm';
import SigninOtpForm from './SigninOtpForm';

export default function AuthContainer() {
  const { step } = useAuthStore();

  const renderStep = () => {
    switch (step) {
      case 'userType':
        return <UserTypeSelector />;
      case 'email':
        return <EmailStep />;
      case 'verification':
        return <VerificationStep />;
      case 'success':
        return <SuccessStep />;
      case 'signin':
        return <SigninForm />;
      case 'signinOtp':
        return <SigninOtpForm />;
      default:
        return <UserTypeSelector />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-md">
        {renderStep()}
      </div>
    </div>
  );
}