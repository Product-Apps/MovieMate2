// app/onboarding/preferences.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { GENRES } from '../../constants/Languages';

const FAVORITE_GENRES = [
  { id: 28, name: 'Action', icon: 'flash' },
  { id: 35, name: 'Comedy', icon: 'happy' },
  { id: 18, name: 'Drama', icon: 'film' },
  { id: 27, name: 'Horror', icon: 'skull' },
  { id: 10749, name: 'Romance', icon: 'heart' },
  { id: 878, name: 'Sci-Fi', icon: 'rocket' },
  { id: 53, name: 'Thriller', icon: 'warning' },
  { id: 12, name: 'Adventure', icon: 'compass' },
  { id: 16, name: 'Animation', icon: 'color-palette' },
  { id: 14, name: 'Fantasy', icon: 'sparkles' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { completeOnboarding, trackFavorite } = usePreferencesStore();
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleContinue = () => {
    if (selectedGenres.length > 0) {
      // Track selected genres as initial preferences
      trackFavorite(selectedGenres);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What genres do you enjoy?</Text>
        <Text style={styles.subtitle}>
          Select at least 3 genres to help us personalize your recommendations
        </Text>

        <View style={styles.genresGrid}>
          {FAVORITE_GENRES.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreCard,
                selectedGenres.includes(genre.id) && styles.genreCardSelected
              ]}
              onPress={() => toggleGenre(genre.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={genre.icon as any} 
                size={32} 
                color={selectedGenres.includes(genre.id) ? '#fff' : '#9333EA'} 
              />
              <Text style={[
                styles.genreName,
                selectedGenres.includes(genre.id) && styles.genreNameSelected
              ]}>
                {genre.name}
              </Text>
              {selectedGenres.includes(genre.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
        </Text>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            selectedGenres.length < 3 && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={selectedGenres.length < 3}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 22,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  genreCard: {
    width: '47%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D2D2D',
    position: 'relative',
  },
  genreCardSelected: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  genreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  genreNameSelected: {
    color: '#fff',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
  },
  selectedCount: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#9333EA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#581c87',
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
