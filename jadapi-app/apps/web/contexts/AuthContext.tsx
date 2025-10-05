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
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({
          uuid: payload.userId,
          email: payload.email,
          displayName: payload.email || 'Admin',
          roles: payload.roles || [],
          status: 'active',
          accountType: 'individual',
        });
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setToken(response.token);
      setUser({
        uuid: response.user.uuid,
        email: response.user.email,
        displayName: response.user.displayName,
        roles: response.user.roles,
        status: response.user.status,
        accountType: response.user.accountType,
      });
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
