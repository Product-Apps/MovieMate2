import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';

interface MovieDetails {
  id: number;
  title: string;
  backdrop_path: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
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

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async (): Promise<void> => {
    try {
      const [movieRes, castRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_API_KEY}`)
      ]);
      
      const movieData = await movieRes.json();
      const castData = await castRes.json();
      
      setMovie(movieData);
      setCast(castData.cast?.slice(0, 10) || []);
    } catch (error) {
      console.error(error);
    }
  };

  if (!movie) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
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
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.playButtonText}>Play Trailer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.watchlistButton}>
              <Ionicons name="add" size={20} color="#9333EA" />
              <Text style={styles.watchlistButtonText}>Watchlist</Text>
            </TouchableOpacity>
          </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  watchlistButtonText: { color: '#9333EA', marginLeft: 5, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  overview: { fontSize: 15, lineHeight: 22 },
  castList: { marginTop: 10 },
  castItem: { width: 100, marginRight: 12 },
  castImage: { width: 80, height: 80, borderRadius: 40 },
  castName: { marginTop: 8, fontSize: 12, textAlign: 'center' },
});
