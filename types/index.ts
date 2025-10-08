export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  vote_average?: number
  genre_ids?: number[]
}

export interface MovieResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface Video {
  id: string
  key: string
  name: string
  site: 'YouTube' | 'Vimeo' | string
  type: 'Trailer' | 'Teaser' | 'Clip' | string
}

export interface VideoResponse {
  id: number
  results: Video[]
}

export interface Genre {
  id: number
  name: string
}

export interface GenreResponse {
  genres: Genre[]
}

export interface Language {
  code: string
  name: string
  flag?: string
}

