import Constants from 'expo-constants'
import { Movie, MovieResponse, VideoResponse, GenreResponse } from '../types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

function getAuthToken(): string | undefined {
  // Prefer expo extra config, fallback to env var if available
  const fromExtra = (Constants?.expoConfig as any)?.extra?.tmdbToken as string | undefined
  const fromEnv = (global as any)?.process?.env?.TMDB_BEARER_TOKEN as string | undefined
  return fromExtra || fromEnv
}

function getHeaders() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('TMDB token is not configured. Add extra.tmdbToken in app.json')
  }
  return {
    Authorization: `Bearer ${token}`,
    accept: 'application/json',
  } as const
}

export const tmdbApi = {
  getTrending: async (mediaType = 'movie', timeWindow = 'day'): Promise<MovieResponse> => {
    const res = await fetch(`${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}` as any, { headers: getHeaders() })
    return res.json()
  },
  getPopularMovies: async (page = 1): Promise<MovieResponse> => {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular?page=${page}` as any, { headers: getHeaders() })
    return res.json()
  },
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}` as any, { headers: getHeaders() })
    return res.json()
  },
  searchMovies: async (query: string, page = 1): Promise<MovieResponse> => {
    const q = encodeURIComponent(query)
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${q}&page=${page}` as any, { headers: getHeaders() })
    return res.json()
  },
  getMovieVideos: async (movieId: number): Promise<VideoResponse> => {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos` as any, { headers: getHeaders() })
    return res.json()
  },
  discoverMovies: async (params: Record<string, string | number>): Promise<MovieResponse> => {
    const qp = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])))
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${qp.toString()}` as any, { headers: getHeaders() })
    return res.json()
  },
  getGenres: async (): Promise<GenreResponse> => {
    const res = await fetch(`${TMDB_BASE_URL}/genre/movie/list` as any, { headers: getHeaders() })
    return res.json()
  },
  getMoviesByMood: async (mood: string, language?: string): Promise<MovieResponse> => {
    console.log("Getting movies for mood:", mood, "and language:", language);
    const moodToGenres: Record<string, number[]> = {
      happy: [35, 10751, 10402], // Comedy, Family, Music
      sad: [18, 10749], // Drama, Romance
      excited: [28, 12, 53], // Action, Adventure, Thriller
      calm: [10751, 99], // Family, Documentary
      adventurous: [12, 14], // Adventure, Fantasy
      romantic: [10749, 35], // Romance, Comedy
      thoughtful: [18, 9648], // Drama, Mystery
      scared: [27, 53], // Horror, Thriller
    }
    const ids = moodToGenres[mood?.toLowerCase?.() || ''] || []
    const base: Record<string, string> = { with_genres: ids.join(','), sort_by: 'popularity.desc' }
    if (language) base.with_original_language = language
    const qp = new URLSearchParams(base)
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${qp.toString()}` as any, { headers: getHeaders() })
    return res.json()
  },
  getImageUrl: (path: string | null, size = 'w500'): string | null => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null),
  getWatchProviders: async (movieId: number): Promise<any> => {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/watch/providers` as any, { headers: getHeaders() })
    return res.json()
  },
  
  // TV Shows API
  getTrendingTVShows: async (): Promise<any> => {
    const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week` as any, { headers: getHeaders() })
    return res.json()
  },
  getPopularTVShows: async (page = 1): Promise<any> => {
    const res = await fetch(`${TMDB_BASE_URL}/tv/popular?page=${page}` as any, { headers: getHeaders() })
    return res.json()
  },
  getTVShowDetails: async (tvId: number): Promise<any> => {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}` as any, { headers: getHeaders() })
    return res.json()
  },
  searchTVShows: async (query: string, page = 1): Promise<any> => {
    const q = encodeURIComponent(query)
    const res = await fetch(`${TMDB_BASE_URL}/search/tv?query=${q}&page=${page}` as any, { headers: getHeaders() })
    return res.json()
  },
  getTVShowVideos: async (tvId: number): Promise<any> => {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/videos` as any, { headers: getHeaders() })
    return res.json()
  },
  
  // Get recent OTT releases (movies released in last 30 days)
  getRecentOTTReleases: async (params?: any): Promise<any> => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const base: any = {
      'primary_release_date.gte': thirtyDaysAgo.toISOString().split('T')[0],
      'primary_release_date.lte': today.toISOString().split('T')[0],
      sort_by: 'primary_release_date.desc',
      with_watch_monetization_types: 'flatrate|free|ads|rent|buy',
      ...params
    }
    
    const qp = new URLSearchParams(base)
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${qp.toString()}` as any, { headers: getHeaders() })
    return res.json()
  },
}