// store/useMoodStore.ts
import { create } from 'zustand';

interface MoodState {
  mood: string;
  setMood: (mood: string) => void;
}

export const useMoodStore = create<MoodState>((set) => ({
  mood: 'adventurous',
  setMood: (mood) => set({ mood }),
}));
