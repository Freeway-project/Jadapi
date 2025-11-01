'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Phone, Lock, Loader2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, tokenManager } from '../../../lib/api/client';
import { useAuthStore } from '../../../lib/stores/authStore';

export default function DriverLoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [phone, setPhone] = useState('123456789');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPhone = phone?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedPhone || !trimmedPassword) {
      toast.error('Please enter phone and password');
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.post('/auth/driver-login', {
        phone: trimmedPhone,
        password: trimmedPassword,
      });

      if (response.data?.success && response.data?.token) {
        tokenManager.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Welcome back!');
        router.push('/driver');
      } else {
        toast.error('Login failed');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid credentials';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Driver Login</h1>
            <p className="text-gray-600 mt-2">Sign in to access your driver dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter phone in E.164 format (e.g., +16045551234)</p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need a driver account?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
