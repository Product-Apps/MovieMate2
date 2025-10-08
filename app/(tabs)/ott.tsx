import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tmdbApi } from '../../api/tmdb';
import { useProfileStore } from '../../store/useProfileStore';
import { Movie } from '../../types';

interface MovieWithProviders extends Movie {
  providers?: string[];
}

export default function OTTScreen() {
  const { language, age } = useProfileStore();
  const [releases, setReleases] = useState<MovieWithProviders[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOTTReleases();
  }, [language, age]);

  const fetchOTTReleases = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (language) {
        params.with_original_language = language;
      }
      
      if (age && age < 17) {
        const maxRating = age < 13 ? 6.0 : 7.5;
        params['vote_average.lte'] = maxRating;
      }
      
      const data = await tmdbApi.getRecentOTTReleases(params);
      setReleases(data.results || []);
    } catch (error) {
      console.error('Error fetching OTT releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOTTReleases();
    setRefreshing(false);
  };

  const getAgeLabel = () => {
    if (!age) return 'All Ages';
    if (age < 13) return 'Family Friendly';
    if (age < 17) return 'Teen Appropriate';
    return 'All Content';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading OTT releases...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest OTT Releases</Text>
        <Text style={styles.headerSubtitle}>Last 30 days</Text>
      </View>

      {(language || age) && (
        <View style={styles.filterInfo}>
          {language && (
            <View style={styles.filterChip}>
              <Ionicons name="globe" size={12} color="#9333EA" />
              <Text style={styles.filterChipText}>{language.toUpperCase()}</Text>
            </View>
          )}
          {age && (
            <View style={styles.filterChip}>
              <Ionicons name="shield-checkmark" size={12} color="#34D399" />
              <Text style={styles.filterChipText}>{getAgeLabel()}</Text>
            </View>
          )}
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9333EA" />
        }
      >
        <View style={styles.grid}>
          {releases.map((movie) => (
            <TouchableOpacity
              key={movie.id}
              style={styles.card}
              onPress={() => router.push(`/movie/${movie.id}`)}
            >
              {movie.poster_path ? (
                <Image
                  source={{ uri: tmdbApi.getImageUrl(movie.poster_path) || undefined }}
                  style={styles.poster}
                />
              ) : (
                <View style={styles.placeholderPoster}>
                  <Ionicons name="film" size={50} color="#6B7280" />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
                <View style={styles.meta}>
                  <View style={styles.rating}>
                    <Ionicons name="star" size={14} color="#FCD34D" />
                    <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.date}>{movie.release_date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 60 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#9CA3AF' },
  header: { paddingHorizontal: 16, marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#9CA3AF' },
  filterInfo: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: '#2D2D2D' },
  filterChipText: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  card: { width: '50%', padding: 8 },
  poster: { width: '100%', height: 250, borderRadius: 12 },
  placeholderPoster: { width: '100%', height: 250, borderRadius: 12, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  info: { marginTop: 8 },
  title: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#D1D5DB' },
  date: { fontSize: 11, color: '#6B7280' },
});
