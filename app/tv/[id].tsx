import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { tmdbApi } from '../../api/tmdb';

export default function TVShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowDetails();
  }, [id]);

  const fetchShowDetails = async () => {
    try {
      setLoading(true);
      const data = await tmdbApi.getTVShowDetails(Number(id));
      setShow(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading TV show...</Text>
      </View>
    );
  }

  if (!show) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load TV show</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchShowDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.backdrop}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/original${show.backdrop_path}` }}
            style={styles.backdropImage}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{show.name}</Text>
          
          <View style={styles.meta}>
            <View style={styles.rating}>
              <Ionicons name="star" size={20} color="#FCD34D" />
              <Text style={styles.ratingText}>{show.vote_average?.toFixed(1)}/10</Text>
            </View>
            <Text style={styles.year}>{show.first_air_date?.substring(0, 4)}</Text>
            <Text style={styles.seasons}>{show.number_of_seasons} Seasons</Text>
          </View>

          <View style={styles.badges}>
            <View style={styles.badge}>
              <Ionicons name="tv" size={16} color="#9333EA" />
              <Text style={styles.badgeText}>TV Series</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="film" size={16} color="#34D399" />
              <Text style={styles.badgeText}>{show.number_of_episodes} Episodes</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{show.overview}</Text>

          {show.genres && show.genres.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genresList}>
                {show.genres.map((genre: any) => (
                  <View key={genre.id} style={styles.genreChip}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#9CA3AF' },
  errorText: { fontSize: 16, color: '#EF4444', marginBottom: 16 },
  retryButton: { backgroundColor: '#9333EA', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  backdrop: { height: 400, position: 'relative' },
  backdropImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },
  content: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 5, fontSize: 16, color: '#D1D5DB' },
  year: { fontSize: 16, color: '#9CA3AF' },
  seasons: { fontSize: 16, color: '#9CA3AF' },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  badgeText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 20, marginBottom: 10 },
  overview: { fontSize: 15, lineHeight: 22, color: '#D1D5DB' },
  genresList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: { backgroundColor: '#9333EA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  genreText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
