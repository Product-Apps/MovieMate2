// store/useMovieStore.ts
import { create } from 'zustand';

interface MovieState {
  selectedMovie: string | null;
  selectedLanguages: string[];
  setMovie: (movieId: string) => void;
  setLanguages: (languages: string[]) => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  selectedMovie: null,
  selectedLanguages: ['hi'],
  setMovie: (movieId) => set({ selectedMovie: movieId }),
  setLanguages: (languages) => set({ selectedLanguages: languages }),
}));
