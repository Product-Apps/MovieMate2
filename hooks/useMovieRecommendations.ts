import { useEffect, useMemo, useState } from 'react'
import { tmdbApi } from '../api/tmdb'
import { Movie, MovieResponse } from '../types'
import { useMoodStore } from '../store/useMoodStore'

type Category = 'recommended' | 'watched' | 'trending' | 'popular'

interface UseMovieRecommendationsOptions {
  category: Category
  page?: number
  query?: string
  languages?: string[]
}

interface UseMovieRecommendationsResult {
  movies: Movie[]
  page: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMovieRecommendations(options: UseMovieRecommendationsOptions): UseMovieRecommendationsResult {
  const { category, page = 1, query, languages } = options
  const mood = useMoodStore((s) => s.mood)

  const [movies, setMovies] = useState<Movie[]>([])
  const [currentPage, setCurrentPage] = useState<number>(page)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const primaryLanguage = useMemo(() => (languages && languages.length > 0 ? languages[0] : undefined), [languages])
  const key = useMemo(() => `${category}:${currentPage}:${query || ''}:${mood}:${primaryLanguage || ''}`, [category, currentPage, query, mood, primaryLanguage])

  async function load(): Promise<void> {
    try {
      setLoading(true)
      setError(null)
      let response: MovieResponse
      switch (category) {
        case 'trending':
          if (primaryLanguage) {
            response = await tmdbApi.discoverMovies({ sort_by: 'popularity.desc', page: currentPage, with_original_language: primaryLanguage })
          } else {
            response = await tmdbApi.getTrending('movie', 'week')
          }
          break
        case 'watched':
          // As a placeholder, show top rated
          response = await tmdbApi.discoverMovies({ sort_by: 'vote_average.desc', page: currentPage, 'vote_count.gte': 1000, ...(primaryLanguage ? { with_original_language: primaryLanguage } : {}) })
          break
        case 'popular':
          if (primaryLanguage) {
            response = await tmdbApi.discoverMovies({ sort_by: 'popularity.desc', page: currentPage, with_original_language: primaryLanguage })
          } else {
            response = await tmdbApi.getPopularMovies(currentPage)
          }
          break
        case 'recommended':
        default:
          if (query && query.trim().length > 0) {
            // Search does not strictly filter by original language; we keep language for localization only
            response = await tmdbApi.searchMovies(query, currentPage)
          } else {
            response = await tmdbApi.getMoviesByMood(mood, primaryLanguage)
          }
          break
      }
      setMovies(response.results || [])
      setTotalPages(response.total_pages || 1)
    } catch (e: any) {
      setError(e?.message || 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(page)
  }, [page])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return {
    movies,
    page: currentPage,
    totalPages,
    loading,
    error,
    refetch: load,
  }
}


