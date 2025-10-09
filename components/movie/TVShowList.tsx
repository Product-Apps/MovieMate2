import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { tmdbApi } from '../../api/tmdb';
import { Ionicons } from '@expo/vector-icons';

interface TVShowListProps {
  title: string;
  shows: any[];
  darkMode?: boolean;
}

export function TVShowList({ title, shows, darkMode }: TVShowListProps) {
  if (!shows || shows.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {shows.map((show, index) => {
          const key = `${show.id}-${show.name}-${index}`;
          return (
            <TouchableOpacity
              key={key}
              style={styles.card}
              onPress={() => router.push({ pathname: '/tv/[id]', params: { id: show.id } })}
            >
              {show.poster_path ? (
                <Image
                  source={{ uri: tmdbApi.getImageUrl(show.poster_path) || undefined }}
                  style={styles.poster}
                />
              ) : (
                <View style={[styles.placeholderPoster, { backgroundColor: darkMode ? '#1E1E1E' : '#E5E7EB' }]}>
                  <Ionicons name="tv" size={50} color="#6B7280" />
                </View>
              )}
              <Text style={[styles.showTitle, { color: darkMode ? '#fff' : '#000' }]} numberOfLines={2}>
                {show.name}
              </Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FCD34D" />
                <Text style={styles.ratingText}>{show.vote_average?.toFixed(1)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 16 },
  scrollView: { paddingLeft: 16 },
  card: { width: 140, marginRight: 12 },
  poster: { width: 140, height: 210, borderRadius: 8 },
  placeholderPoster: { width: 140, height: 210, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  showTitle: { marginTop: 8, fontSize: 14, fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#D1D5DB' },
});
