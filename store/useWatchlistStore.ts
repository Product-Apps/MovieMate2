// store/useWatchlistStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WatchlistState {
  watchlist: number[];
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  toggleWatchlist: (movieId: number) => void;
  hydrate: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlist: [],
  
  addToWatchlist: (movieId) => {
    const newWatchlist = [...get().watchlist, movieId];
    set({ watchlist: newWatchlist });
    AsyncStorage.setItem('watchlist', JSON.stringify(newWatchlist)).catch(() => {});
  },
  
  removeFromWatchlist: (movieId) => {
    const newWatchlist = get().watchlist.filter(id => id !== movieId);
    set({ watchlist: newWatchlist });
    AsyncStorage.setItem('watchlist', JSON.stringify(newWatchlist)).catch(() => {});
  },
  
  isInWatchlist: (movieId) => {
    return get().watchlist.includes(movieId);
  },
  
  toggleWatchlist: (movieId) => {
    if (get().isInWatchlist(movieId)) {
      get().removeFromWatchlist(movieId);
    } else {
      get().addToWatchlist(movieId);
    }
  },
  
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem('watchlist');
      if (saved) {
        set({ watchlist: JSON.parse(saved) });
      }
    } catch {}
  },
}));
