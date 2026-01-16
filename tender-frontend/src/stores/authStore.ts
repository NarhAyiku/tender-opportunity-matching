import { create } from 'zustand';
import { User } from '../types';
import { authApi, usersApi } from '../api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: true });
      get().fetchUser();
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('token', response.access_token);
      set({ token: response.access_token, isAuthenticated: true, isLoading: false });
      await get().fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      set({
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  signup: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.signup({ email, password, name });
      localStorage.setItem('token', response.access_token);
      set({ token: response.access_token, isAuthenticated: true, isLoading: false });
      await get().fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      set({
        error: error.response?.data?.detail || 'Signup failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const user = await usersApi.getMe();
      set({ user });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));
