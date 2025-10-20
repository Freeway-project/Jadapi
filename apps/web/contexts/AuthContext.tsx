'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, tokenManager } from '../lib/api/auth';
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
        const parts = storedToken.split('.');
        if (parts.length === 3 && parts[1]) {
          const payload = JSON.parse(atob(parts[1]));
          setUser({
            uuid: payload.userId,
            email: payload.email,
            displayName: payload.email || 'Admin',
            roles: payload.roles || [],
            status: 'active',
            accountType: 'individual',
          });
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        tokenManager.removeToken();
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting login...');
      const response = await authAPI.login(email, password);
      console.log('AuthContext: Login response received', { hasToken: !!response.token, hasUser: !!response.user });

      // Token is already stored in localStorage by authAPI.login
      // Now update the state
      setToken(response.token);
      setUser({
        uuid: response.user.uuid,
        email: response.user.email,
        displayName: response.user.displayName || response.user.name || response.user.email || 'Admin',
        roles: response.user.roles || [],
        status: response.user.status || 'active',
        accountType: response.user.accountType || 'individual',
      });
      console.log('AuthContext: State updated successfully');
    } catch (error: any) {
      console.error('AuthContext: Login error', error);
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
