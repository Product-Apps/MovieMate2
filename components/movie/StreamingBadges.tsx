import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { tmdbApi } from '../../api/tmdb';

interface StreamingBadgesProps {
  movieId: number;
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export default function StreamingBadges({ movieId }: StreamingBadgesProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, [movieId]);

  const fetchProviders = async () => {
    try {
      const data = await tmdbApi.getWatchProviders(movieId);
      const results = data?.results?.US || data?.results?.IN || {};
      const flatrate = results.flatrate || [];
      setProviders(flatrate.slice(0, 5));
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || providers.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available on</Text>
      <View style={styles.badges}>
        {providers.map((provider) => (
          <View key={provider.provider_id} style={styles.badge}>
            <Text style={styles.badgeText}>{provider.provider_name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: '#9333EA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
