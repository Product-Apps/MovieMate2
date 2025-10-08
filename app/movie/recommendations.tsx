import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
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
              <MovieList key={key} movies={data.movies} hideTitle />
            ) : (
              <Text style={styles.emptyText}>No movies found for this period</Text>
            )}
          </View>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  loadingText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 30,
  },
});
