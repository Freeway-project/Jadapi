'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, tokenManager } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface User {
  uuid: string;
  email?: string;
  displayName: string;
  roles: string[];
  status: string;
  accountType: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated on mount
    checkAuth();
  }, []);

  const checkAuth = () => {
    const storedToken = tokenManager.getToken();
    if (storedToken) {
      setToken(storedToken);
      // You could also decode the JWT here to get user info
      // For now, we'll assume if token exists, user is authenticated
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    authAPI.logout();
    setToken(null);
    setUser(null);
    router.push('/admin/login');
  };

  const isAuthenticated = !!token || authAPI.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
