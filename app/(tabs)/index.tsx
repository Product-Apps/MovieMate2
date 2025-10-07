import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useColorScheme, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [currentMood, setCurrentMood] = useState<string>('adventurous');
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const mood = await AsyncStorage.getItem('mood');
    const favs = await AsyncStorage.getItem('favorites');
    setCurrentMood(mood || 'adventurous');
    setFavorites(favs ? JSON.parse(favs) : []);
    await fetchMovies();
  };

  const fetchMovies = async (): Promise<void> => {
    setLoading(true);
    try {
      const [trendingRes, recommendedRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`),
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`)
      ]);
      
      const trendingData = await trendingRes.json();
      const recommendedData = await recommendedRes.json();
      
      setTrendingMovies(trendingData.results?.slice(0, 10) || []);
      setRecommendedMovies(recommendedData.results?.slice(0, 10) || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchMovies();
  };

  const toggleFavorite = async (movieId: string): Promise<void> => {
    let newFavorites = [...favorites];
    if (favorites.includes(movieId)) {
      newFavorites = newFavorites.filter(id => id !== movieId);
    } else {
      newFavorites.push(movieId);
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const getFavoriteMovies = (): Movie[] => {
    return recommendedMovies.filter(movie => favorites.includes(movie.id.toString())).slice(0, 5);
  };

  const MovieCard = ({ movie }: { movie: Movie }) => {
    const isFavorite = favorites.includes(movie.id.toString());
    
    return (
      <TouchableOpacity 
        style={styles.movieCard}
        onPress={() => router.push(`/movie/${movie.id}`)}
      >
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.moviePoster}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(movie.id.toString())}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={20} 
            color={isFavorite ? '#EF4444' : '#fff'} 
          />
        </TouchableOpacity>
        <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
      </TouchableOpacity>
    );
  };

  const MovieSection = ({ title, movies }: { title: string; movies: Movie[] }) => {
    if (movies.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {title}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          MovieMate
        </Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.moodBanner}>
          <Ionicons name="happy" size={40} color="#fff" />
          <View style={styles.moodText}>
            <Text style={styles.moodLabel}>Your Current Mood</Text>
            <Text style={styles.moodValue}>{currentMood.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={() => router.push('/(tabs)/mood')}>
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>

        <MovieSection title="Your Favorites" movies={getFavoriteMovies()} />
        <MovieSection title="Recommended For You" movies={recommendedMovies} />
        <MovieSection title="Trending Now" movies={trendingMovies} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  moodBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 20, backgroundColor: '#7C3AED', borderRadius: 15 },
  moodText: { flex: 1, marginLeft: 15 },
  moodLabel: { color: '#E9D5FF', fontSize: 14 },
  moodValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  updateButton: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  updateButtonText: { color: '#7C3AED', fontWeight: '600' },
  section: { marginTop: 20, paddingLeft: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  movieCard: { width: 150, marginRight: 12 },
  moviePoster: { width: 150, height: 200, borderRadius: 10 },
  favoriteButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 },
  movieTitle: { marginTop: 5, fontSize: 12, fontWeight: '500' },
});
