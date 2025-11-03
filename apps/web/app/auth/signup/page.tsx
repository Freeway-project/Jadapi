'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../../lib/stores/authStore';
import AuthContainer from '../../../components/auth/AuthContainer';

export default function SignupPage() {
  const { setStep } = useAuthStore();

  useEffect(() => {
    // Set step to userType (start of signup flow) when this page loads
    setStep('userType');
  }, [setStep]);

  return <AuthContainer />;
}