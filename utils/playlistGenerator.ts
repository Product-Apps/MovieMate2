// utils/playlistGenerator.ts
import { tmdbApi } from '../api/tmdb';
import { Movie } from '../types';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  movies: Movie[];
  totalRuntime: number;
  mood: string;
}

const MOOD_TO_PLAYLIST = {
  happy: {
    name: 'Feel-Good Marathon',
    description: 'Uplifting movies to brighten your day',
    count: 4,
  },
  sad: {
    name: 'Emotional Journey',
    description: 'Deep, moving stories that touch the heart',
    count: 3,
  },
  excited: {
    name: 'Action-Packed Night',
    description: 'High-octane thrills and adventures',
    count: 4,
  },
  calm: {
    name: 'Peaceful Evening',
    description: 'Relaxing films for a quiet night',
    count: 3,
  },
  adventurous: {
    name: 'Epic Adventure Quest',
    description: 'Journey through fantastical worlds',
    count: 4,
  },
  romantic: {
    name: 'Love Story Collection',
    description: 'Heartwarming tales of romance',
    count: 3,
  },
  thoughtful: {
    name: 'Mind-Bending Marathon',
    description: 'Thought-provoking cinema',
    count: 3,
  },
  scared: {
    name: 'Horror Night',
    description: 'Spine-chilling thrills',
    count: 4,
  },
};

export const playlistGenerator = {
  generatePlaylist: async (mood: string, language?: string): Promise<Playlist> => {
    const config = MOOD_TO_PLAYLIST[mood as keyof typeof MOOD_TO_PLAYLIST] || MOOD_TO_PLAYLIST.happy;
    
    try {
      const data = await tmdbApi.getMoviesByMood(mood, language);
      const movies = data.results.slice(0, config.count);
      
      // Estimate runtime (average 120 minutes per movie)
      const totalRuntime = movies.length * 120;
      
      return {
        id: `${mood}-${Date.now()}`,
        name: config.name,
        description: config.description,
        movies,
        totalRuntime,
        mood,
      };
    } catch (error) {
      console.error('Error generating playlist:', error);
      return {
        id: `${mood}-${Date.now()}`,
        name: config.name,
        description: config.description,
        movies: [],
        totalRuntime: 0,
        mood,
      };
    }
  },

  generateCustomPlaylist: async (
    name: string,
    description: string,
    genreIds: number[],
    count: number = 4
  ): Promise<Playlist> => {
    try {
      const data = await tmdbApi.discoverMovies({
        with_genres: genreIds.join(','),
        sort_by: 'popularity.desc',
      });
      
      const movies = data.results.slice(0, count);
      const totalRuntime = movies.length * 120;
      
      return {
        id: `custom-${Date.now()}`,
        name,
        description,
        movies,
        totalRuntime,
        mood: 'custom',
      };
    } catch (error) {
      console.error('Error generating custom playlist:', error);
      return {
        id: `custom-${Date.now()}`,
        name,
        description,
        movies: [],
        totalRuntime: 0,
        mood: 'custom',
      };
    }
  },

  formatRuntime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },
};
