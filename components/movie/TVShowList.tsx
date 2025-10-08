import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { tmdbApi } from '../../api/tmdb';
import { Ionicons } from '@expo/vector-icons';

interface TVShowListProps {
  title: string;
  shows: any[];
}

export function TVShowList({ title, shows }: TVShowListProps) {
  if (!shows || shows.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {shows.map((show) => (
          <TouchableOpacity
            key={show.id}
            style={styles.card}
            onPress={() => router.push(`/tv/${show.id}`)}
          >
            {show.poster_path ? (
              <Image
                source={{ uri: tmdbApi.getImageUrl(show.poster_path) || undefined }}
                style={styles.poster}
              />
            ) : (
              <View style={styles.placeholderPoster}>
                <Ionicons name="tv" size={50} color="#6B7280" />
              </View>
            )}
            <Text style={styles.showTitle} numberOfLines={2}>
              {show.name}
            </Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#FCD34D" />
              <Text style={styles.ratingText}>{show.vote_average?.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 12, paddingHorizontal: 16 },
  scrollView: { paddingLeft: 16 },
  card: { width: 140, marginRight: 12 },
  poster: { width: 140, height: 210, borderRadius: 8 },
  placeholderPoster: { width: 140, height: 210, borderRadius: 8, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  showTitle: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#fff' },
  rating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#D1D5DB' },
});
