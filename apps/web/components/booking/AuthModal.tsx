'use client';

import { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { authAPI, tokenManager } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/stores/authStore';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      if (isEmail) {
        await authAPI.requestEmailOTP({
          email: identifier.trim(),
          type: 'login',
        });
      } else {
        await authAPI.requestPhoneOTP({
          phoneNumber: identifier.trim(),
          type: 'login',
        });
      }
      toast.success('OTP sent successfully');
      setStep('otp');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        identifier: identifier.trim(),
        code: otpCode,
        type: 'login',
      });

      if (response.verified && response.token && response.user) {
        // Store token
        tokenManager.setToken(response.token);

        // Update user in store
        setUser(response.user);

        toast.success('Logged in successfully');
        onSuccess();
        onClose();
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sign in to continue</h2>
          <p className="text-sm text-gray-600 mt-1">
            {step === 'input'
              ? 'Enter your email or phone number to receive an OTP'
              : 'Enter the 6-digit code sent to your phone'}
          </p>
        </div>

        {/* Input Step */}
        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  placeholder="email@example.com or +1234567890"
                  className="pl-10 h-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              onClick={handleSendOtp}
              disabled={isLoading || !identifier.trim()}
              className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold rounded-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send OTP'
              )}
            </Button>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  disabled={isLoading}
                />
              ))}
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold rounded-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <button
              onClick={() => {
                setStep('input');
                setOtp(['', '', '', '', '', '']);
              }}
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change email/phone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
