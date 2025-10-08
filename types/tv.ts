// types/tv.ts
export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TVShowResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  overview: string;
}
