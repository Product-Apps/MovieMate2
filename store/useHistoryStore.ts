// store/useHistoryStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryItem {
  movieId: number;
  timestamp: number;
}

interface HistoryState {
  history: HistoryItem[];
  addToHistory: (movieId: number) => void;
  getRecentlyViewed: (limit?: number) => number[];
  clearHistory: () => void;
  hydrate: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  
  addToHistory: (movieId) => {
    const existing = get().history.filter(item => item.movieId !== movieId);
    const newHistory = [{ movieId, timestamp: Date.now() }, ...existing].slice(0, 50); // Keep last 50
    set({ history: newHistory });
    AsyncStorage.setItem('history', JSON.stringify(newHistory)).catch(() => {});
  },
  
  getRecentlyViewed: (limit = 10) => {
    return get().history.slice(0, limit).map(item => item.movieId);
  },
  
  clearHistory: () => {
    set({ history: [] });
    AsyncStorage.removeItem('history').catch(() => {});
  },
  
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem('history');
      if (saved) {
        set({ history: JSON.parse(saved) });
      }
    } catch {}
  },
}));
