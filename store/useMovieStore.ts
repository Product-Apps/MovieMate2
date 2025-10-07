// store/useMovieStore.ts
import { create } from 'zustand';

interface MovieState {
  selectedMovie: string | null;
  setMovie: (movieId: string) => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  selectedMovie: null,
  setMovie: (movieId) => set({ selectedMovie: movieId }),
}));
