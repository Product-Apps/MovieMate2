
import { View, Text, StyleSheet, TextInput, ScrollView, Image, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tmdbApi } from '../../api/tmdb';
import { Movie } from '../../types';
import { debounce } from 'lodash';
import FilterPanel, { FilterOptions } from '../../components/filters/FilterPanel';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    yearRange: [1990, 2025],
    genres: [],
    minRating: 0,
    sortBy: 'popularity.desc'
  });

  const searchMovies = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      if (filters.genres.length > 0 || filters.minRating > 0 || filters.yearRange[0] > 1990 || filters.yearRange[1] < 2025) {
        // Use discover with filters
        const params: any = {
          sort_by: filters.sortBy,
          'primary_release_date.gte': `${filters.yearRange[0]}-01-01`,
          'primary_release_date.lte': `${filters.yearRange[1]}-12-31`,
        };
        if (filters.genres.length > 0) params.with_genres = filters.genres.join(',');
        if (filters.minRating > 0) params['vote_average.gte'] = filters.minRating;
        const data = await tmdbApi.discoverMovies(params);
        const filtered = data.results.filter((m: Movie) => 
          m.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(filtered);
      } else {
        const data = await tmdbApi.searchMovies(searchQuery);
        setResults(data.results || []);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const debouncedSearch = useCallback(debounce(searchMovies, 300), []);

  const styles = getStyles(colorScheme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a movie..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            debouncedSearch(text);
          }}
          autoFocus
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={24} color="#9333EA" />
          {(filters.genres.length > 0 || filters.minRating > 0) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filters.genres.length + (filters.minRating > 0 ? 1 : 0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          if (query) searchMovies(query);
        }}
        currentFilters={filters}
      />

      {loading && <ActivityIndicator size="large" color="#9333EA" />}

      {!loading && results.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="film-outline" size={80} color="#6B7280" />
          <Text style={styles.emptyText}>
            {query ? `No results for "${query}"` : 'Find your next favorite movie.'}
          </Text>
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
                  source={{ uri: tmdbApi.getImageUrl(movie.poster_path) || undefined }}
                  style={styles.poster}
                />
              ) : (
                <View style={styles.placeholderPoster}>
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

const getStyles = (colorScheme: string | null | undefined) => StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20, gap: 12 },
  searchInput: { flex: 1, fontSize: 18, padding: 12, backgroundColor: '#1E1E1E', borderRadius: 10, color: '#fff' },
  filterButton: { padding: 12, backgroundColor: '#1E1E1E', borderRadius: 10, position: 'relative' },
  filterBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 20, fontSize: 16, color: '#6B7280', textAlign: 'center' },
  results: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  gridItem: { width: '50%', padding: 8 },
  poster: { width: '100%', height: 250, borderRadius: 10 },
  placeholderPoster: { width: '100%', height: 250, borderRadius: 10, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  movieTitle: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center' },
});
