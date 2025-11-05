'use client';

import { useAuthStore } from '../../lib/stores/authStore';
import Header from '../layout/Header';
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-y-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-4 py-4 sm:py-8">
          <div className="w-full max-w-md">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}