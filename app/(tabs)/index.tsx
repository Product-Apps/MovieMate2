import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { useMovieRecommendations } from '../../hooks/useMovieRecommendations';
import { MovieList } from '../../components/movie/MovieList';
import { TVShowList } from '../../components/movie/TVShowList';
import NewsFeed from '../../components/news/NewsFeed';
import { Movie } from '../../types';
import { tmdbApi } from '../../api/tmdb';
import { useMoodStore } from '../../store/useMoodStore';

export default function HomeScreen() {
  const { language, age, hydrate: hydrateProfile } = useProfileStore();
  const { favorites, hydrate: hydrateFavorites } = useFavoritesStore();
  const { getRecentlyViewed, hydrate: hydrateHistory } = useHistoryStore();
  const { watchlist, hydrate: hydrateWatchlist } = useWatchlistStore();
  const { getTopGenres, hydrate: hydratePreferences } = usePreferencesStore();
  const { mood } = useMoodStore();
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [recentlyViewedMovies, setRecentlyViewedMovies] = useState<Movie[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<any[]>([]);
  const [personalizedMovies, setPersonalizedMovies] = useState<Movie[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { movies: recommendedMovies, loading: loadingRecommended, refetch: refetchRecommended } = useMovieRecommendations({
    category: 'recommended',
    languages: language ? [language] : [],
  });

  const { movies: trendingMovies, loading: loadingTrending, refetch: refetchTrending } = useMovieRecommendations({
    category: 'trending',
    languages: language ? [language] : [],
  });

  useEffect(() => {
    hydrateProfile();
    hydrateFavorites();
    hydrateHistory();
    hydrateWatchlist();
    hydratePreferences();
  }, []);

  useEffect(() => {
    fetchFavoriteMovies();
  }, [favorites]);

  useEffect(() => {
    fetchRecentlyViewed();
    fetchTVShows();
    fetchPersonalizedRecommendations();
  }, [language, age]);

  useEffect(() => {
    fetchWatchlistMovies();
  }, [watchlist]);

  const fetchFavoriteMovies = async () => {
    if (favorites.length === 0) {
      setFavoriteMovies([]);
      return;
    }
    try {
      const moviePromises = favorites.map(id => tmdbApi.getMovieDetails(id));
      const results = await Promise.allSettled(moviePromises);
      const movies = results
        .filter(result => result.status === 'fulfilled')
        .map((result: any) => result.value);
      setFavoriteMovies(movies);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchRecentlyViewed = async () => {
    const recentIds = getRecentlyViewed(10);
    if (recentIds.length === 0) {
      setRecentlyViewedMovies([]);
      return;
    }
    try {
      const moviePromises = recentIds.map(id => tmdbApi.getMovieDetails(id));
      const results = await Promise.allSettled(moviePromises);
      const movies = results
        .filter(result => result.status === 'fulfilled')
        .map((result: any) => result.value);
      setRecentlyViewedMovies(movies);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    }
  };

  const fetchWatchlistMovies = async () => {
    if (watchlist.length === 0) {
      setWatchlistMovies([]);
      return;
    }
    try {
      const moviePromises = watchlist.map(id => tmdbApi.getMovieDetails(id));
      const results = await Promise.allSettled(moviePromises);
      const movies = results
        .filter(result => result.status === 'fulfilled')
        .map((result: any) => result.value);
      setWatchlistMovies(movies);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const fetchTVShows = async () => {
    try {
      const data = await tmdbApi.getTrendingTVShows();
      let shows = data.results || [];
      
      // Filter by language if set (but keep some shows if none match)
      if (language) {
        const filtered = shows.filter((show: any) => show.original_language === language);
        if (filtered.length > 0) {
          shows = filtered;
        }
      }
      
      // Filter by age-appropriate content
      if (age && age < 17) {
        const maxRating = age < 13 ? 6.5 : 8.0; // More lenient ratings
        shows = shows.filter((show: any) => show.vote_average <= maxRating);
      }
      
      setTrendingTVShows(shows.slice(0, 10));
    } catch (error) {
      console.error('Error fetching TV shows:', error);
      setTrendingTVShows([]); // Set empty array on error
    }
  };

  const fetchPersonalizedRecommendations = async () => {
    try {
      const topGenres = getTopGenres(3);
      if (topGenres.length === 0) return;

      const params: any = {
        with_genres: topGenres.join(','),
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
      };

      if (language) {
        params.with_original_language = language;
      }

      const data = await tmdbApi.discoverMovies(params);
      setPersonalizedMovies(data.results?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchRecommended(), 
      refetchTrending(), 
      fetchFavoriteMovies(),
      fetchRecentlyViewed(),
      fetchWatchlistMovies(),
      fetchTVShows(),
      fetchPersonalizedRecommendations()
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MovieMate</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <TouchableOpacity style={styles.moodBanner} onPress={() => router.push('/(tabs)/mood')}>
          <Ionicons name="happy" size={30} color="#fff" />
          <View style={styles.moodText}>
            <Text style={styles.moodLabel}>Your Current Mood</Text>
            <Text style={styles.moodValue}>{mood.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => router.push('/(tabs)/mood')}
          >
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {recentlyViewedMovies.length > 0 && (
          <MovieList key="continue-exploring" title="Continue Exploring" movies={recentlyViewedMovies} />
        )}
        {watchlistMovies.length > 0 && (
          <MovieList key="watchlist" title="Your Watchlist" movies={watchlistMovies} />
        )}
        {favoriteMovies.length > 0 && (
          <MovieList key="favorites" title="Your Favorites" movies={favoriteMovies} />
        )}
        {personalizedMovies.length > 0 && (
          <MovieList key="personalized" title="Because You Watched" movies={personalizedMovies} />
        )}
        <MovieList key="recommended" title="Recommended for You" movies={recommendedMovies} />
        {trendingTVShows.length > 0 && (
          <TVShowList key="trending-tv" title="Trending TV Shows" shows={trendingTVShows} />
        )}
        <MovieList key="trending-movies" title="Trending Movies" movies={trendingMovies} />
        
        <View style={styles.newsSection}>
          <NewsFeed />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  moodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 20,
    backgroundColor: '#7C3AED',
    borderRadius: 15,
  },
  moodText: {
    flex: 1,
    marginLeft: 15,
  },
  moodLabel: {
    color: '#E9D5FF',
    fontSize: 14,
  },
  moodValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  newsSection: {
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
});