'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../../lib/stores/authStore';
import AuthContainer from '../../../components/auth/AuthContainer';

export default function SigninPage() {
  const { setStep } = useAuthStore();

  useEffect(() => {
    // Set step to signin when this page loads
    setStep('signin');
  }, [setStep]);

  return <AuthContainer />;
}