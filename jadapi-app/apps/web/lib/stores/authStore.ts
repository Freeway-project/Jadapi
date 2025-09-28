import { create } from 'zustand';
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

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setUserType: (userType) => set({ userType }),

  setAuthMode: (authMode) => set({ authMode }),

  setEmail: (email) => set({ email }),

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setUser: (user) => set({ user }),

  reset: () => set(initialState),
}));