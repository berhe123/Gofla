import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@/shared';
import { api, tokenStore, unwrap } from '@/shared/api/client';

interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setUser: (user: UserDto | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        const data = await unwrap<{ user: UserDto; accessToken: string; refreshToken: string }>(
          api.post('/auth/login', { email, password }),
        );
        tokenStore.set(data.accessToken, data.refreshToken);
        set({ user: data.user, isAuthenticated: true });
      },

      register: async (payload) => {
        const data = await unwrap<{ user: UserDto; accessToken: string; refreshToken: string }>(
          api.post('/auth/register', payload),
        );
        tokenStore.set(data.accessToken, data.refreshToken);
        set({ user: data.user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', { refreshToken: tokenStore.refresh });
        } catch {
          /* ignore */
        }
        tokenStore.clear();
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        if (!tokenStore.access) {
          set({ hydrated: true });
          return;
        }
        try {
          const user = await unwrap<UserDto>(api.get('/users/me'));
          set({ user, isAuthenticated: true, hydrated: true });
        } catch {
          tokenStore.clear();
          set({ user: null, isAuthenticated: false, hydrated: true });
        }
      },
    }),
    { name: 'gofla.auth', partialize: (s) => ({ user: s.user }) },
  ),
);
