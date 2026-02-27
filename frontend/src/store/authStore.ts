import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  status: string;
  emailVerified: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (authResponse: AuthResponse) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (authResponse: AuthResponse) => {
        localStorage.setItem('token', authResponse.accessToken);
        set({
          user: authResponse.user,
          token: authResponse.accessToken,
          isAuthenticated: true,
        });
      },
      setUser: (user: User) => set({ user }),
      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
