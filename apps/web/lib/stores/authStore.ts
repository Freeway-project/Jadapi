import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, UserType } from '../types/auth';

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
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        set({ ...initialState, user: null });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data
      partialize: (state) => ({ user: state.user }),
    }
  )
);