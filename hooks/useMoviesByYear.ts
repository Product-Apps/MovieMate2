// hooks/useMoviesByYear.ts
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

interface YearRange {
  start: number;
  end: number;
}

function getAuthToken(): string {
  const fromExtra = (Constants.expoConfig as any)?.extra?.tmdbToken;
  const fromEnv = process.env.EXPO_PUBLIC_TMDB_API_KEY;
  if (!fromExtra && !fromEnv) {
    console.warn('TMDB token missing in extra or env');
  }
  return fromExtra || fromEnv || '';
}

export const useMoviesByYear = (yearRange: YearRange, languages: string[] = []) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      };

      const params = new URLSearchParams({
        sort_by: 'popularity.desc',
        vote_average_gte: '6.0',
        vote_count_gte: '100',
        include_adult: 'false',
        page: Math.floor(Math.random() * 5 + 1).toString(),
        with_release_type: '3',
        region: 'IN',
      });

      if (yearRange.start === yearRange.end) {
        params.append('primary_release_year', yearRange.start.toString());
      } else {
        params.append('primary_release_date.gte', `${yearRange.start}-01-01`);
        params.append('primary_release_date.lte', `${yearRange.end}-12-31`);
      }

      if (languages.length) {
        params.append('with_original_language', languages.join(','));
      }

      const url = `https://api.themoviedb.org/3/discover/movie?${params}`;
      console.log('[useMoviesByYear] URL:', url);
      console.log('[useMoviesByYear] Headers:', headers);

      try {
        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        console.log('[useMoviesByYear] data.results:', data.results?.length);
        setMovies(data.results?.slice(0, 10) || []);
      } catch (err) {
        console.error('[useMoviesByYear] error:', err);
        setError(err instanceof Error ? err.message : String(err));
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [yearRange.start, yearRange.end, languages.join(',')]);

  return { movies, loading, error };
};
