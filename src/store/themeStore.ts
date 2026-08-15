import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

const stored = localStorage.getItem('smart-hub-theme');

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: stored ? stored === 'dark' : true,
  toggle: () => {
    const next = !get().isDark;
    localStorage.setItem('smart-hub-theme', next ? 'dark' : 'light');
    set({ isDark: next });
  },
}));
