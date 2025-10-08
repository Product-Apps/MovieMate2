// store/usePreferencesStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPreferences {
  clickedMovies: number[];
  favoriteGenres: Record<number, number>; // genreId -> count
  viewedGenres: Record<number, number>;
  lastUpdated: number;
  hasCompletedOnboarding: boolean;
}

interface PreferencesState extends UserPreferences {
  trackMovieClick: (movieId: number, genreIds: number[]) => void;
  trackFavorite: (genreIds: number[]) => void;
  getTopGenres: (limit?: number) => number[];
  completeOnboarding: () => void;
  hydrate: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  clickedMovies: [],
  favoriteGenres: {},
  viewedGenres: {},
  lastUpdated: Date.now(),
  hasCompletedOnboarding: false,
  
  trackMovieClick: (movieId, genreIds) => {
    const state = get();
    const newClickedMovies = [...new Set([...state.clickedMovies, movieId])].slice(-100);
    const newViewedGenres = { ...state.viewedGenres };
    
    genreIds.forEach(genreId => {
      newViewedGenres[genreId] = (newViewedGenres[genreId] || 0) + 1;
    });
    
    const newState = {
      clickedMovies: newClickedMovies,
      viewedGenres: newViewedGenres,
      lastUpdated: Date.now()
    };
    
    set(newState);
    AsyncStorage.setItem('preferences', JSON.stringify({ ...state, ...newState })).catch(() => {});
  },
  
  trackFavorite: (genreIds) => {
    const state = get();
    const newFavoriteGenres = { ...state.favoriteGenres };
    
    genreIds.forEach(genreId => {
      newFavoriteGenres[genreId] = (newFavoriteGenres[genreId] || 0) + 2; // Weight favorites more
    });
    
    set({ favoriteGenres: newFavoriteGenres, lastUpdated: Date.now() });
    AsyncStorage.setItem('preferences', JSON.stringify({ ...state, favoriteGenres: newFavoriteGenres })).catch(() => {});
  },
  
  getTopGenres: (limit = 3) => {
    const state = get();
    const combined: Record<number, number> = {};
    
    // Combine viewed and favorite genres with weights
    Object.entries(state.viewedGenres).forEach(([genreId, count]) => {
      combined[Number(genreId)] = count;
    });
    
    Object.entries(state.favoriteGenres).forEach(([genreId, count]) => {
      combined[Number(genreId)] = (combined[Number(genreId)] || 0) + count * 2;
    });
    
    return Object.entries(combined)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([genreId]) => Number(genreId));
  },
  
  completeOnboarding: () => {
    const state = get();
    set({ hasCompletedOnboarding: true });
    AsyncStorage.setItem('hasCompletedOnboarding', 'true').catch(() => {});
    AsyncStorage.setItem('preferences', JSON.stringify({ ...state, hasCompletedOnboarding: true })).catch(() => {});
  },
  
  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem('preferences');
      const onboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      
      if (saved) {
        const data = JSON.parse(saved);
        set({
          clickedMovies: data.clickedMovies || [],
          favoriteGenres: data.favoriteGenres || {},
          viewedGenres: data.viewedGenres || {},
          lastUpdated: data.lastUpdated || Date.now(),
          hasCompletedOnboarding: onboarding === 'true'
        });
      } else if (onboarding === 'true') {
        set({ hasCompletedOnboarding: true });
      }
    } catch {}
  },
}));
