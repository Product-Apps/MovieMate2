import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languages: string[] = [
  'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 
  'Marathi', 'Gujarati', 'Punjabi', 'English', 'Spanish', 'French'
];

const words: string[] = [
  'Adventure', 'Calm', 'Exciting', 'Romantic', 'Thrilling', 
  'Funny', 'Mysterious', 'Epic', 'Dramatic', 'Light-hearted'
];

const moodColors: string[] = [
  '#3B82F6', '#9333EA', '#F97316', '#EF4444', 
  '#10B981', '#EC4899', '#14B8A6', '#F59E0B'
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');

  const toggleWord = (word: string): void => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const calculateMood = (): string => {
    if (selectedWords.includes('Calm') || selectedWords.includes('Romantic')) {
      return 'relaxed';
    } else if (selectedWords.includes('Exciting') || selectedWords.includes('Thrilling')) {
      return 'excited';
    } else if (selectedWords.includes('Funny')) {
      return 'happy';
    } else if (selectedWords.includes('Mysterious')) {
      return 'thoughtful';
    } else {
      return 'adventurous';
    }
  };

  const handleGetStarted = async (): Promise<void> => {
    if (selectedWords.length === 0) {
      alert('Please select at least one word');
      return;
    }
    
    const mood = calculateMood();
    await AsyncStorage.setItem('language', selectedLanguage);
    await AsyncStorage.setItem('mood', mood);
    await AsyncStorage.setItem('selectedWords', JSON.stringify(selectedWords));
    await AsyncStorage.setItem('onboardingComplete', 'true');
    
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Welcome to MovieMate
        </Text>
        <Text style={styles.subtitle}>Find your perfect movie match!</Text>

        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Select Your Language:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.chip, selectedLanguage === lang && { backgroundColor: '#9333EA' }]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text style={[styles.chipText, selectedLanguage === lang && { color: '#fff' }]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Pick Words That Resonate:
        </Text>
        <View style={styles.wordContainer}>
          {words.map((word) => (
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

        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Choose Your Mood Color:
        </Text>
        <View style={styles.colorContainer}>
          {moodColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: selectedColor }]} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  chipScroll: { marginBottom: 10 },
  chip: { backgroundColor: '#374151', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10 },
  chipText: { color: '#D1D5DB', fontSize: 14 },
  wordContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  wordChip: { backgroundColor: '#374151', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10, marginBottom: 10 },
  colorContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 },
  colorCircle: { width: 60, height: 60, borderRadius: 30, marginRight: 15, marginBottom: 15 },
  selectedColor: { borderWidth: 3, borderColor: '#fff' },
  button: { paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
