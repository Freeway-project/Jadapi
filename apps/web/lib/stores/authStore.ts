import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, UserType } from '../types/auth';
import { tokenManager } from '../api/client';

interface AuthStore extends AuthState {
  setStep: (step: AuthState['step']) => void;
  setUserType: (userType: UserType) => void;
  setAuthMode: (authMode: 'signup' | 'signin') => void;
  setEmail: (email: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: any) => void;
  reset: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const initialState: AuthState = {
  step: 'userType',
  userType: null,
  authMode: 'signup',
  email: '',
  phoneNumber: '',
  isLoading: false,
  error: null,
  user: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setUserType: (userType) => set({ userType }),

      setAuthMode: (authMode) => set({ authMode }),

      setEmail: (email) => set({ email }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setUser: (user) => {
        // Store user data in both state and localStorage
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        set({ user });
      },

      reset: () => set(initialState),

      logout: () => {
        // Remove token from localStorage
        tokenManager.removeToken();
        // Remove user data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        // Reset store state
        set({ ...initialState, user: null });
      },

      isAuthenticated: function(): boolean {
        const hasToken = !!tokenManager.getToken();
        // If no token, definitely not authenticated
        if (!hasToken) return false;

        // Check if user exists in current state
        const state: AuthStore = useAuthStore.getState();
        return !!state?.user;
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data
      partialize: (state) => ({ user: state.user }),
    }
  )
);