import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
}

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const searchMovies = async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${searchQuery}`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TextInput
          style={[styles.searchInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
          placeholder="Search movies..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            searchMovies(text);
          }}
          autoFocus
        />
      </View>

      {results.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={80} color="#6B7280" />
          <Text style={styles.emptyText}>Search for your favorite movies</Text>
        </View>
      )}

      <ScrollView style={styles.results}>
        <View style={styles.grid}>
          {results.map(movie => (
            <TouchableOpacity
              key={movie.id}
              style={styles.gridItem}
              onPress={() => router.push(`/movie/${movie.id}`)}
            >
              {movie.poster_path ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                  style={styles.poster}
                />
              ) : (
                <View style={[styles.poster, { backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="film" size={50} color="#6B7280" />
                </View>
              )}
              <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 16, fontSize: 18 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 20, fontSize: 16, color: '#6B7280' },
  results: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  gridItem: { width: '48%', marginBottom: 16, marginRight: '2%' },
  poster: { width: '100%', height: 220, borderRadius: 10 },
  movieTitle: { marginTop: 5, fontSize: 12, fontWeight: '500' },
});
