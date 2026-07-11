import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  apply: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        get().apply();
      },
      apply: () => {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(get().theme);
      },
    }),
    { name: 'gofla.theme.v2' },
  ),
);
