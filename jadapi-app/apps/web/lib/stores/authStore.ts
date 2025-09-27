import { create } from 'zustand';
import { AuthState, UserType } from '../types/auth';

interface AuthStore extends AuthState {
  setStep: (step: AuthState['step']) => void;
  setUserType: (userType: UserType) => void;
  setEmail: (email: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  step: 'userType',
  userType: null,
  email: '',
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setUserType: (userType) => set({ userType }),

  setEmail: (email) => set({ email }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));