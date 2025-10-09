import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MovieList } from '../../components/movie/MovieList';
import { Ionicons } from '@expo/vector-icons';
import { useMoviesByYear } from '../../hooks/useMoviesByYear';

export default function RecommendationsScreen() {
  const router = useRouter();
  const { mood, language } = useLocalSearchParams<{ mood: string; language: string }>();
  const langs = language ? [language] : [];

  const currentYear = new Date().getFullYear();
  const thisYear = useMoviesByYear({ start: currentYear, end: currentYear }, langs);
  const twenties = useMoviesByYear({ start: 2020, end: 2029 }, langs);
  const nineties = useMoviesByYear({ start: 1990, end: 1999 }, langs);
  const eighties = useMoviesByYear({ start: 1980, end: 1989 }, langs);

  const sections = [
    { key: 'thisYear', title: `Latest This Year (${currentYear})`, data: thisYear },
    { key: 'twenties', title: '2020s Hits', data: twenties },
    { key: 'nineties', title: '90s Classics', data: nineties },
    { key: 'eighties', title: '80s Legends', data: eighties },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Movies for your {mood} mood</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {sections.map(({ key, title, data }) => (
          <View key={key} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {data.loading ? (
              <Text style={styles.loadingText}>Loading…</Text>
            ) : data.movies.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {data.movies.map((movie, index) => (
                  <View key={`${movie.id}-${index}`} style={styles.movieCard}>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/movie/[id]', params: { id: movie.id } })}>
                      <View style={styles.posterContainer}>
                        {movie.poster_path ? (
                          <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                            style={styles.moviePoster}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.noPoster}>
                            <Text style={styles.noPosterText}>No Image</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.movieInfo}>
                        <Text style={styles.movieTitle} numberOfLines={2}>
                          {movie.title}
                        </Text>
                        {movie.release_date && (
                          <Text style={styles.movieYear}>
                            {new Date(movie.release_date).getFullYear()}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>No movies found for this period</Text>
            )}
          </View>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  loadingText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  movieCard: {
    width: 150,
    marginLeft: 16,
  },
  posterContainer: {
    width: 150,
    height: 225,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
  },
  posterPlaceholder: {
    fontSize: 48,
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  noPoster: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
  },
  noPosterText: {
    color: '#666',
    fontSize: 12,
  },
  movieInfo: {
    marginTop: 8,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  movieYear: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  bottomPadding: {
    height: 30,
  },
});
