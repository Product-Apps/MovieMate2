// app/onboarding/welcome.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferencesStore } from '../../store/usePreferencesStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { completeOnboarding } = usePreferencesStore();

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.backgroundGradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#e94560', '#9333EA', '#7C3AED']}
              style={styles.iconGradient}
            >
              <Ionicons name="film" size={60} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Welcome to MovieMate</Text>
          <Text style={styles.subtitle}>
            Discover movies that match your mood, track your favorites, and never miss what's trending
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: '#e94560' }]}>
                <Ionicons name="happy" size={24} color="#fff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Mood-Based Discovery</Text>
                <Text style={styles.featureDescription}>Find movies that match how you feel</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: '#9333EA' }]}>
                <Ionicons name="sparkles" size={24} color="#fff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Recommendations</Text>
                <Text style={styles.featureDescription}>Personalized picks based on your taste</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: '#34D399' }]}>
                <Ionicons name="bookmark" size={24} color="#fff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Track & Organize</Text>
                <Text style={styles.featureDescription}>Watchlist, history, and favorites</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/onboarding/preferences')}
          >
            <LinearGradient
              colors={['#e94560', '#9333EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B4B4C5',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#B4B4C5',
    lineHeight: 18,
  },
  button: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: '#B4B4C5',
    textDecorationLine: 'underline',
  },
});
