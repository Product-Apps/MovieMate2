// store/useMoodStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MoodState {
  mood: string;
  setMood: (mood: string) => void;
  hydrate: () => Promise<void>;
}

export const useMoodStore = create<MoodState>((set) => ({
  mood: 'adventurous',
  setMood: (mood) => {
    set({ mood })
    AsyncStorage.setItem('mood', mood).catch(() => {})
  },
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem('mood')
      if (saved) set({ mood: saved })
    } catch {}
  },
}));
