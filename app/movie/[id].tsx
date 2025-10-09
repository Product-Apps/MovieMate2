import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme, Linking, Alert, ActivityIndicator, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { tmdbApi } from '../../api/tmdb'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { useWatchlistStore } from '../../store/useWatchlistStore'
import { useHistoryStore } from '../../store/useHistoryStore'
import { usePreferencesStore } from '../../store/usePreferencesStore'
import StreamingBadges from '../../components/movie/StreamingBadges'

interface MovieDetails {
  id: number;
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
}

interface CastMember {
  id: number;
  name: string;
  profile_path: string | null;
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  
  const { toggleFavorite, isFavorite, hydrate: hydrateFavorites } = useFavoritesStore()
  const { toggleWatchlist, isInWatchlist, hydrate: hydrateWatchlist } = useWatchlistStore()
  const { addToHistory } = useHistoryStore()
  const { trackMovieClick, trackFavorite } = usePreferencesStore()

  useEffect(() => {
    hydrateFavorites()
    hydrateWatchlist()
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const movieData = await tmdbApi.getMovieDetails(Number(id)) as any
      const creditsRes = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits` as any, { headers: (tmdbApi as any).getHeaders?.() || {} })
      const castData = await creditsRes.json()
      
      setMovie(movieData);
      setCast(castData.cast?.slice(0, 10) || []);
      
      // Track viewing history and preferences
      addToHistory(Number(id));
      const genreIds = movieData.genres?.map((g: any) => g.id) || movieData.genre_ids || [];
      trackMovieClick(Number(id), genreIds);
      
      setLoading(false);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handlePlayTrailer = async () => {
    if (!movie || isPlayingTrailer) return;

    setIsPlayingTrailer(true);
    try {
      const videos = (await tmdbApi.getMovieVideos(movie.id)) as any;
      const results = videos?.results || [];
      const trailer =
        results.find(
          (v: any) => v.type === "Trailer" && v.site === "YouTube" && v.official
        ) ||
        results.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
        results.find((v: any) => v.site === "YouTube");

      if (!trailer) {
        Alert.alert("No trailer available", "This movie does not have a trailer.");
        setIsPlayingTrailer(false);
        return;
      }

      const trailerUrl = Platform.select({
        ios: `youtube://watch?v=${trailer.key}`,
        android: `vnd.youtube:${trailer.key}`,
        default: `https://www.youtube.com/watch?v=${trailer.key}`,
      });

      const fallbackUrl = `https://www.youtube.com/watch?v=${trailer.key}`;

      try {
        const supported = await Linking.canOpenURL(trailerUrl);
        if (supported) {
          await Linking.openURL(trailerUrl);
        } else {
          await Linking.openURL(fallbackUrl);
        }
      } catch (error) {
        await Linking.openURL(fallbackUrl);
      }

      // Reset after 2 seconds to allow retry if needed
      setTimeout(() => setIsPlayingTrailer(false), 2000);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message || "Failed to play trailer");
      setIsPlayingTrailer(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  const handleFavoriteToggle = () => {
    if (!movie) return;
    toggleFavorite(movie.id);
    if (!isFavorite(movie.id)) {
      const genreIds = movie.genres?.map((g) => g.id) || movie.genre_ids || [];
      trackFavorite(genreIds);
    }
  };

  const handleWatchlistToggle = () => {
    if (!movie) return;
    toggleWatchlist(movie.id);
  };

  if (error || !movie) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={[styles.errorText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {error || 'Failed to load movie'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMovieDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
          <Text style={styles.backButtonErrorText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.backdrop}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/original${movie.backdrop_path}` }}
            style={styles.backdropImage}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            {movie.title}
          </Text>
          
          <View style={styles.meta}>
            <View style={styles.rating}>
              <Ionicons name="star" size={20} color="#FCD34D" />
              <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}/10</Text>
            </View>
            <Text style={styles.year}>{movie.release_date?.substring(0, 4)}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleFavoriteToggle}>
              <Ionicons name={isFavorite(movie.id) ? 'heart' : 'heart-outline'} size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayTrailer}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.playButtonText}>Play Trailer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.watchlistButton, isInWatchlist(movie.id) && styles.watchlistButtonActive]} 
              onPress={handleWatchlistToggle}
            >
              <Ionicons 
                name={isInWatchlist(movie.id) ? "checkmark" : "add"} 
                size={20} 
                color={isInWatchlist(movie.id) ? "#fff" : "#9333EA"} 
              />
              <Text style={[styles.watchlistButtonText, isInWatchlist(movie.id) && styles.watchlistButtonTextActive]}>
                {isInWatchlist(movie.id) ? "In Watchlist" : "Watchlist"}
              </Text>
            </TouchableOpacity>
          </View>

          <StreamingBadges movieId={movie.id} />

          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Overview
          </Text>
          <Text style={[styles.overview, { color: colorScheme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
            {movie.overview}
          </Text>

          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Cast
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castList}>
            {cast.map(person => (
              <View key={person.id} style={styles.castItem}>
                {person.profile_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w200${person.profile_path}` }}
                    style={styles.castImage}
                  />
                ) : (
                  <View style={[styles.castImage, { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="person" size={40} color="#6B7280" />
                  </View>
                )}
                <Text style={styles.castName} numberOfLines={2}>{person.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: { marginTop: 16, fontSize: 16, textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#9333EA', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  retryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  backButtonError: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12 },
  backButtonErrorText: { color: '#9CA3AF', fontSize: 16 },
  backdrop: { height: 400, position: 'relative' },
  backdropImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },
  content: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rating: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  ratingText: { marginLeft: 5, fontSize: 16, color: '#D1D5DB' },
  year: { fontSize: 16, color: '#9CA3AF' },
  buttons: { flexDirection: 'row', marginBottom: 20 },
  playButton: { flex: 1, flexDirection: 'row', backgroundColor: '#9333EA', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  playButtonText: { color: '#fff', marginLeft: 5, fontWeight: '600' },
  watchlistButton: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: '#9333EA', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  watchlistButtonActive: { backgroundColor: '#9333EA', borderColor: '#9333EA' },
  watchlistButtonText: { color: '#9333EA', marginLeft: 5, fontWeight: '600' },
  watchlistButtonTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  overview: { fontSize: 15, lineHeight: 22 },
  castList: { marginTop: 10 },
  castItem: { width: 100, marginRight: 12 },
  castImage: { width: 80, height: 80, borderRadius: 40 },
  castName: { marginTop: 8, fontSize: 12, textAlign: 'center' },
});
