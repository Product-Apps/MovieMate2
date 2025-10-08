// store/useThemeStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getEffectiveTheme: () => 'light' | 'dark';
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'auto',
  
  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem('theme', mode).catch(() => {});
  },
  
  getEffectiveTheme: () => {
    const { mode } = get();
    if (mode === 'auto') {
      const systemTheme = useColorScheme();
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  },
  
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        set({ mode: saved as ThemeMode });
      }
    } catch {}
  },
}));
