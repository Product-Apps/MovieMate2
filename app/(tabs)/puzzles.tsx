// app/(tabs)/puzzles.tsx
import { StyleSheet, ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMoodStore } from '../../store/useMoodStore';
import { useMovieStore } from '../../store/useMovieStore';
import ColorHarmonyPuzzle from '../../components/puzzle/ColorHarmonyPuzzle';
import PatternCompletionPuzzle from '../../components/puzzle/PatternCompletionPuzzle';

export default function PuzzlesScreen() {
  const router = useRouter();
  const mood = useMoodStore((state) => state.mood);
  const setMovie = useMovieStore((state) => state.setMovie);

  const handleComplete = (movieId: string) => {
    setMovie(movieId);
    Alert.alert('Success!', 'Puzzle completed! Here are your movie recommendations.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mood Puzzles</Text>
        <Text style={styles.subtitle}>Solve puzzles to match your {mood} vibe!</Text>
      </View>
      
      <ColorHarmonyPuzzle onComplete={() => handleComplete('movie123')} />
      <PatternCompletionPuzzle onComplete={() => handleComplete('movie456')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, alignItems: 'center', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#9CA3AF', textAlign: 'center' },
});
