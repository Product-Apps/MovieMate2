import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { tmdbApi } from '../../api/tmdb';
import { useProfileStore } from '../../store/useProfileStore';

interface NewsItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  type: 'upcoming' | 'trending';
  vote_average: number;
  original_language: string;
}

export default function NewsFeed({ darkMode }: { darkMode?: boolean }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, age } = useProfileStore();

  useEffect(() => {
    fetchNews();
  }, [language, age]);

  const getContentRating = (userAge: number | null): string => {
    if (!userAge) return ''; // No age filter
    if (userAge < 13) return 'G,PG'; // Kids content
    if (userAge < 17) return 'G,PG,PG-13'; // Teen content
    return ''; // All content
  };

  const fetchNews = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Build params based on profile
      const upcomingParams: any = {
        'primary_release_date.gte': today,
        'primary_release_date.lte': futureDate,
        sort_by: 'popularity.desc',
      };

      const trendingParams: any = {
        sort_by: 'popularity.desc',
      };

      // Filter by language if set
      if (language) {
        upcomingParams.with_original_language = language;
        trendingParams.with_original_language = language;
      }

      // Filter by age-appropriate content
      if (age && age < 17) {
        const maxRating = age < 13 ? 6.0 : 7.5; // Softer content for younger users
        upcomingParams['vote_average.lte'] = maxRating;
        trendingParams['vote_average.lte'] = maxRating;
      }

      const [upcoming, trending] = await Promise.all([
        tmdbApi.discoverMovies(upcomingParams),
        tmdbApi.discoverMovies(trendingParams)
      ]);

      const newsItems: NewsItem[] = [
        ...upcoming.results.slice(0, 5).map((m: any) => ({ ...m, type: 'upcoming' as const })),
        ...trending.results.slice(0, 5).map((m: any) => ({ ...m, type: 'trending' as const }))
      ];

      setNews(newsItems);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  const getAgeLabel = () => {
    if (!age) return 'All Ages';
    if (age < 13) return 'Family Friendly';
    if (age < 17) return 'Teen Appropriate';
    return 'All Content';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Latest News</Text>
        {(language || age) && (
          <View style={styles.filterInfo}>
            {language && (
              <View style={styles.filterChip}>
                <Ionicons name="globe" size={12} color="#9333EA" />
                <Text style={styles.filterChipText}>{language.toUpperCase()}</Text>
              </View>
            )}
            {age && (
              <View style={styles.filterChip}>
                <Ionicons name="shield-checkmark" size={12} color="#34D399" />
                <Text style={styles.filterChipText}>{getAgeLabel()}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {news.map((item) => (
        <TouchableOpacity
          key={`${item.type}-${item.id}`}
          style={styles.newsCard}
          onPress={() => router.push(`/movie/${item.id}`)}
        >
          <View style={styles.newsContent}>
            <View style={styles.newsBadge}>
              <Text style={styles.newsBadgeText}>
                {item.type === 'upcoming' ? '🎬 UPCOMING' : '🔥 TRENDING'}
              </Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsOverview} numberOfLines={3}>{item.overview}</Text>
            <View style={styles.newsFooter}>
              <View style={styles.newsRating}>
                <Ionicons name="star" size={14} color="#FCD34D" />
                <Text style={styles.newsRatingText}>{item.vote_average?.toFixed(1)}</Text>
              </View>
              <Text style={styles.newsDate}>
                {item.type === 'upcoming' ? `Releases: ${item.release_date}` : 'Trending Now'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9333EA" />
            </View>
          </View>
          {item.poster_path && (
            <Image
              source={{ uri: tmdbApi.getImageUrl(item.poster_path, 'w200') || undefined }}
              style={styles.newsPoster}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#121212' },
  headerContainer: { marginBottom: 16 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  filterInfo: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, borderWidth: 1, borderColor: '#2D2D2D' },
  filterChipText: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  loadingText: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
  newsCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D2D2D' },
  newsContent: { flex: 1, marginRight: 12 },
  newsBadge: { backgroundColor: '#9333EA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  newsBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  newsTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  newsOverview: { fontSize: 13, color: '#9CA3AF', lineHeight: 18, marginBottom: 12 },
  newsFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  newsRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newsRatingText: { fontSize: 12, color: '#FCD34D', fontWeight: '600' },
  newsDate: { fontSize: 12, color: '#6B7280', flex: 1, marginLeft: 8 },
  newsPoster: { width: 80, height: 120, borderRadius: 8 },
});
