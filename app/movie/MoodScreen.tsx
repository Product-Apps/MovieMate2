import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const wordAssociations = [
  'Adventure', 'Calm', 'Exciting', 'Romantic', 'Thrilling',
  'Funny', 'Mysterious', 'Epic', 'Dramatic', 'Light-hearted'
];

const moodColors = ['#3B82F6', '#9333EA', '#F97316', '#EF4444', '#10B981', '#EC4899', '#14B8A6', '#F59E0B'];

export default function MoodScreen() {
  const colorScheme = useColorScheme();
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [moodSlider, setMoodSlider] = useState(50);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const GameCard = ({ title, description, icon, gameId }: { title: string, description: string, icon: any, gameId: string }) => {
    const isSelected = selectedGame === gameId;
    return (
      <TouchableOpacity
        style={[styles.gameCard, isSelected && { borderColor: '#9333EA', borderWidth: 2 }]}
        onPress={() => setSelectedGame(gameId)}
      >
        <Ionicons name={icon} size={40} color={isSelected ? '#9333EA' : '#6B7280'} />
        <View style={styles.gameText}>
          <Text style={[styles.gameTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{title}</Text>
          <Text style={styles.gameDescription}>{description}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#9333EA" />}
      </TouchableOpacity>
    );
  };

  const toggleWord = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const calculateMood = () => {
    if (selectedGame === 'word_association') {
      if (selectedWords.includes('Calm') || selectedWords.includes('Romantic')) return 'relaxed';
      if (selectedWords.includes('Exciting') || selectedWords.includes('Thrilling')) return 'excited';
      if (selectedWords.includes('Funny')) return 'happy';
      return 'adventurous';
    } else if (selectedGame === 'mood_slider') {
      if (moodSlider < 40) return 'relaxed';
      if (moodSlider < 60) return 'thoughtful';
      return 'adventurous';
    }
    return 'happy';
  };

  const saveMood = async () => {
    const mood = calculateMood();
    await AsyncStorage.setItem('mood', mood);
    
    const historyStr = await AsyncStorage.getItem('moodHistory');
    let history = historyStr ? JSON.parse(historyStr) : [];
    history.unshift({
      mood,
      date: new Date().toLocaleDateString(),
      movieCount: Math.floor(Math.random() * 20) + 5
    });
    await AsyncStorage.setItem('moodHistory', JSON.stringify(history));
    
    alert(`Mood saved: ${mood}`);
    setSelectedGame('');
    setSelectedWords([]);
    setMoodSlider(50);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Capture Your Mood
        </Text>
        <Text style={styles.subtitle}>Play quick games to help us understand your vibe!</Text>

        <GameCard title="Word Association" description="Pick words that resonate with you" icon="text" gameId="word_association" />
        <GameCard title="Mood Slider" description="Slide from calm to adventurous" icon="options" gameId="mood_slider" />
        <GameCard title="Color Palette" description="Choose a color that matches your mood" icon="color-palette" gameId="color_picker" />

        {selectedGame === 'word_association' && (
          <View style={styles.gameContent}>
            <Text style={[styles.contentTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Select words that match your current feeling:
            </Text>
            <View style={styles.wordContainer}>
              {wordAssociations.map(word => (
                <TouchableOpacity
                  key={word}
                  style={[styles.wordChip, selectedWords.includes(word) && { backgroundColor: '#9333EA' }]}
                  onPress={() => toggleWord(word)}
                >
                  <Text style={[styles.chipText, selectedWords.includes(word) && { color: '#fff' }]}>
                    {word}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedGame === 'mood_slider' && (
          <View style={styles.gameContent}>
            <Text style={[styles.contentTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Slide to express your mood:
            </Text>
            <View style={styles.sliderContainer}>
              <Text>😌 Calm</Text>
              <View style={styles.slider}>
                {[0, 20, 40, 60, 80, 100].map(val => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.sliderDot, moodSlider >= val && { backgroundColor: '#9333EA' }]}
                    onPress={() => setMoodSlider(val)}
                  />
                ))}
              </View>
              <Text>🔥 Adventurous</Text>
            </View>
            <Text style={styles.sliderValue}>
              {moodSlider < 20 ? 'Very Calm' : moodSlider < 40 ? 'Relaxed' : moodSlider < 60 ? 'Neutral' : moodSlider < 80 ? 'Excited' : 'Adventurous'}
            </Text>
          </View>
        )}

        {selectedGame === 'color_picker' && (
          <View style={styles.gameContent}>
            <Text style={[styles.contentTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Pick a color that represents your mood:
            </Text>
            <View style={styles.colorContainer}>
              {moodColors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorCircle
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
        )}

        {selectedGame && (
          <TouchableOpacity style={styles.saveButton} onPress={saveMood}>
            <Text style={styles.saveButtonText}>Save Mood & Get Recommendations</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginBottom: 30 },
  gameCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', padding: 16, borderRadius: 15, marginBottom: 15 },
  gameText: { flex: 1, marginLeft: 15 },
  gameTitle: { fontSize: 18, fontWeight: 'bold' },
  gameDescription: { fontSize: 14, color: '#9CA3AF', marginTop: 5 },
  gameContent: { marginTop: 30 },
  contentTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  wordContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  wordChip: { backgroundColor: '#374151', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10, marginBottom: 10 },
  chipText: { color: '#D1D5DB', fontSize: 14 },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  slider: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15 },
  sliderDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#374151' },
  sliderValue: { fontSize: 20, fontWeight: 'bold', color: '#9333EA', textAlign: 'center', marginTop: 10 },
  colorContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  colorCircle: { width: 60, height: 60, borderRadius: 30, marginRight: 15, marginBottom: 15 },
  selectedColorCircle: { borderWidth: 3, borderColor: '#fff' },
  saveButton: { backgroundColor: '#9333EA', paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginVertical: 30 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
