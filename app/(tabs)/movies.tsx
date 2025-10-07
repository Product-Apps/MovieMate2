import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

interface MoodHistoryEntry {
  mood: string;
  date: string;
  movieCount: number;
}

export default function MoviesScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<string>('recommended');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodHistoryEntry[]>([]);

  useEffect(() => {
    loadMoodHistory();
    fetchMovies(activeTab);
  }, [activeTab]);

  const loadMoodHistory = async (): Promise<void> => {
    const history = await AsyncStorage.getItem('moodHistory');
    if (history) {
      setMoodHistory(JSON.parse(history).slice(0, 3));
    }
  };

  const fetchMovies = async (category: string): Promise<void> => {
    try {
      let url: string;
      if (category === 'trending') {
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`;
      } else if (category === 'watched') {
        url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_API_KEY}`;
      } else {
        url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  const showPremiumDialog = (): void => {
    alert('Unlock full mood history and unlimited saves for just $1.99/month!\n\nFeatures:\n• Full mood history\n• Ad-free experience\n• Deeper analytics');
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.tabs}>
        {['recommended', 'watched', 'trending'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.historySection}>
        <Text style={[styles.historyTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Mood History
        </Text>
        {moodHistory.length === 0 ? (
          <Text style={styles.historyEmpty}>No mood history yet. Play mood games to start!</Text>
        ) : (
          moodHistory.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyMood}>{entry.mood}</Text>
              <Text style={styles.historyDate}>{entry.date}</Text>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.premiumButton} onPress={showPremiumDialog}>
          <Text style={styles.premiumText}>⭐ Unlock Full History - Premium</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.movieGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {movies.map(movie => (
            <TouchableOpacity
              key={movie.id}
              style={styles.gridItem}
              onPress={() => router.push(`/movie/${movie.id}`)}
            >
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                style={styles.gridPoster}
              />
              <Text style={styles.gridTitle} numberOfLines={2}>{movie.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#9333EA' },
  tabText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#9333EA' },
  historySection: { padding: 16, backgroundColor: '#1F2937', margin: 16, borderRadius: 10 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  historyEmpty: { color: '#9CA3AF', fontSize: 14 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  historyMood: { color: '#fff', fontSize: 16, fontWeight: '600' },
  historyDate: { color: '#9CA3AF', fontSize: 14 },
  premiumButton: { marginTop: 10, padding: 12, backgroundColor: '#FCD34D', borderRadius: 8 },
  premiumText: { color: '#000', fontWeight: '600', textAlign: 'center' },
  movieGrid: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  gridItem: { width: '48%', marginBottom: 16, marginRight: '2%' },
  gridPoster: { width: '100%', height: 220, borderRadius: 10 },
  gridTitle: { marginTop: 5, fontSize: 12, fontWeight: '500' },
});
