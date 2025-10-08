import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { playlistGenerator, Playlist } from '../../utils/playlistGenerator';
import { tmdbApi } from '../../api/tmdb';
import { useWatchlistStore } from '../../store/useWatchlistStore';

export default function PlaylistScreen() {
  const { mood } = useLocalSearchParams<{ mood: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToWatchlist } = useWatchlistStore();

  useEffect(() => {
    generatePlaylist();
  }, [mood]);

  const generatePlaylist = async () => {
    setLoading(true);
    const generated = await playlistGenerator.generatePlaylist(mood || 'happy');
    setPlaylist(generated);
    setLoading(false);
  };

  const addAllToWatchlist = () => {
    playlist?.movies.forEach(movie => addToWatchlist(movie.id));
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Creating your playlist...</Text>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to create playlist</Text>
        <TouchableOpacity style={styles.retryButton} onPress={generatePlaylist}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Movie Playlist</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.playlistHeader}>
          <Ionicons name="film" size={48} color="#9333EA" />
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.playlistDescription}>{playlist.description}</Text>
          <View style={styles.playlistMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={20} color="#9CA3AF" />
              <Text style={styles.metaText}>{playlistGenerator.formatRuntime(playlist.totalRuntime)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="film" size={20} color="#9CA3AF" />
              <Text style={styles.metaText}>{playlist.movies.length} movies</Text>
            </View>
          </View>
        </View>

        <View style={styles.moviesSection}>
          {playlist.movies.map((movie, index) => (
            <TouchableOpacity
              key={movie.id}
              style={styles.movieCard}
              onPress={() => router.push(`/movie/${movie.id}`)}
            >
              <View style={styles.movieNumber}>
                <Text style={styles.movieNumberText}>{index + 1}</Text>
              </View>
              {movie.poster_path ? (
                <Image
                  source={{ uri: tmdbApi.getImageUrl(movie.poster_path, 'w200') || undefined }}
                  style={styles.moviePoster}
                />
              ) : (
                <View style={styles.placeholderPoster}>
                  <Ionicons name="film" size={40} color="#6B7280" />
                </View>
              )}
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <View style={styles.movieRating}>
                  <Ionicons name="star" size={16} color="#FCD34D" />
                  <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}</Text>
                </View>
                <Text style={styles.movieOverview} numberOfLines={3}>{movie.overview}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addAllButton} onPress={addAllToWatchlist}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addAllButtonText}>Add All to Watchlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.regenerateButton} onPress={generatePlaylist}>
          <Ionicons name="refresh" size={20} color="#9333EA" />
          <Text style={styles.regenerateButtonText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#1E1E1E' },
  backButton: { padding: 8, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1 },
  loadingText: { color: '#9CA3AF', marginTop: 16, fontSize: 16 },
  errorText: { color: '#EF4444', fontSize: 16 },
  retryButton: { marginTop: 16, backgroundColor: '#9333EA', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  playlistHeader: { alignItems: 'center', padding: 24, backgroundColor: '#1E1E1E', marginBottom: 20 },
  playlistName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 16, textAlign: 'center' },
  playlistDescription: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  playlistMeta: { flexDirection: 'row', gap: 24, marginTop: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  moviesSection: { paddingHorizontal: 16 },
  movieCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12, marginBottom: 12, position: 'relative' },
  movieNumber: { position: 'absolute', top: 8, left: 8, backgroundColor: '#9333EA', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  movieNumberText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  moviePoster: { width: 80, height: 120, borderRadius: 8 },
  placeholderPoster: { width: 80, height: 120, borderRadius: 8, backgroundColor: '#2D2D2D', justifyContent: 'center', alignItems: 'center' },
  movieInfo: { flex: 1, marginLeft: 12 },
  movieTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  movieRating: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ratingText: { marginLeft: 4, fontSize: 14, color: '#D1D5DB' },
  movieOverview: { fontSize: 12, color: '#9CA3AF', lineHeight: 16 },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#2D2D2D', backgroundColor: '#1E1E1E' },
  addAllButton: { flex: 2, flexDirection: 'row', backgroundColor: '#9333EA', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  addAllButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  regenerateButton: { flex: 1, flexDirection: 'row', borderWidth: 1, borderColor: '#9333EA', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  regenerateButtonText: { color: '#9333EA', fontWeight: '600', fontSize: 16 },
});
