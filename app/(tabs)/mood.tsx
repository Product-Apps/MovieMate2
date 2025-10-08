import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Pressable, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useMoodStore } from '../../store/useMoodStore';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useCallback } from 'react';
import LanguageSelector from '../../components/movie/LanguageSelector';
import { LANGUAGES } from '../../constants/Languages';

// Enhanced mood detection questions
const MOOD_QUESTIONS = [
  {
    id: 1,
    question: "How's your energy level right now?",
    type: 'energy',
    options: [
      { id: 'high', label: 'High Energy', icon: 'flash', color: '#F87171', moods: { excited: 3, happy: 2, adventurous: 2 } },
      { id: 'medium', label: 'Balanced', icon: 'sunny', color: '#FBBF24', moods: { calm: 2, thoughtful: 1, romantic: 1 } },
      { id: 'low', label: 'Low Energy', icon: 'moon', color: '#60A5FA', moods: { calm: 3, sad: 2, thoughtful: 1 } },
    ]
  },
  {
    id: 2,
    question: "What kind of experience are you seeking?",
    type: 'experience',
    options: [
      { id: 'escape', label: 'Escape Reality', icon: 'rocket', color: '#A78BFA', moods: { adventurous: 3, excited: 2, happy: 1 } },
      { id: 'reflect', label: 'Deep Thoughts', icon: 'bulb', color: '#FBBF24', moods: { thoughtful: 3, sad: 2, calm: 1 } },
      { id: 'laugh', label: 'Laugh & Smile', icon: 'happy', color: '#FCD34D', moods: { happy: 3, excited: 1, romantic: 1 } },
      { id: 'thrill', label: 'Get Thrilled', icon: 'skull', color: '#EF4444', moods: { scared: 3, excited: 2, adventurous: 1 } },
    ]
  },
  {
    id: 3,
    question: "How do you feel emotionally?",
    type: 'emotion',
    options: [
      { id: 'joyful', label: 'Joyful', icon: 'heart', color: '#FB7185', moods: { happy: 3, romantic: 2, excited: 1 } },
      { id: 'melancholic', label: 'Melancholic', icon: 'rainy', color: '#60A5FA', moods: { sad: 3, thoughtful: 2, calm: 1 } },
      { id: 'peaceful', label: 'Peaceful', icon: 'leaf', color: '#34D399', moods: { calm: 3, thoughtful: 1, romantic: 1 } },
      { id: 'restless', label: 'Restless', icon: 'flash', color: '#F87171', moods: { excited: 3, adventurous: 2, scared: 1 } },
    ]
  },
  {
    id: 4,
    question: "What pace do you prefer right now?",
    type: 'pace',
    options: [
      { id: 'fast', label: 'Fast-Paced', icon: 'speedometer', color: '#F87171', moods: { excited: 3, adventurous: 2, scared: 1 } },
      { id: 'slow', label: 'Slow & Steady', icon: 'time', color: '#34D399', moods: { calm: 3, thoughtful: 2, romantic: 2 } },
      { id: 'varied', label: 'Mix of Both', icon: 'shuffle', color: '#A78BFA', moods: { adventurous: 2, thoughtful: 2, excited: 1 } },
    ]
  }
];

const MOOD_RESULTS = {
  happy: { label: 'Happy', icon: 'happy', color: '#FCD34D', description: 'Comedy & Feel-good movies' },
  sad: { label: 'Sad', icon: 'sad', color: '#60A5FA', description: 'Drama & Emotional stories' },
  excited: { label: 'Excited', icon: 'flash', color: '#F87171', description: 'Action & Thriller movies' },
  calm: { label: 'Calm', icon: 'leaf', color: '#34D399', description: 'Peaceful & Relaxing films' },
  adventurous: { label: 'Adventurous', icon: 'compass', color: '#A78BFA', description: 'Adventure & Fantasy' },
  romantic: { label: 'Romantic', icon: 'heart', color: '#FB7185', description: 'Romance & Love stories' },
  thoughtful: { label: 'Thoughtful', icon: 'bulb', color: '#FBBF24', description: 'Drama & Mystery' },
  scared: { label: 'Scared', icon: 'skull', color: '#EF4444', description: 'Horror & Suspense' },
};

export default function MoodScreen() {
  const router = useRouter();
  const { mood, setMood } = useMoodStore();
  const [mode, setMode] = useState<'select' | 'questionnaire'>('select');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Reset questionnaire when user returns to this screen
  useFocusEffect(
    useCallback(() => {
      // Only reset if we're in questionnaire mode and have completed it
      // This ensures fresh start each time user comes back
      if (mode === 'questionnaire' && currentQuestion >= MOOD_QUESTIONS.length) {
        resetQuestionnaire();
      }
    }, [mode, currentQuestion])
  );

  const handleDirectMoodSelect = (moodId: string) => {
    setMood(moodId);
    router.push({ 
      pathname: '/movie/recommendations', 
      params: { 
        mood: moodId,
        language: selectedLanguages.join(',')
      } 
    });
  };

  const handleAnswerSelect = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion]: optionId };
    setAnswers(newAnswers);

    // Animate transition
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentQuestion < MOOD_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        calculateMoodFromAnswers(newAnswers);
      }
    });
  };

  const calculateMoodFromAnswers = (finalAnswers: Record<number, string>) => {
    const moodScores: Record<string, number> = {};

    MOOD_QUESTIONS.forEach((question, index) => {
      const answerId = finalAnswers[index];
      const selectedOption = question.options.find(opt => opt.id === answerId);
      
      if (selectedOption) {
        Object.entries(selectedOption.moods).forEach(([mood, score]) => {
          moodScores[mood] = (moodScores[mood] || 0) + score;
        });
      }
    });

    const detectedMood = Object.entries(moodScores).reduce((a, b) => 
      moodScores[a[0]] > moodScores[b[0]] ? a : b
    )[0];

    setMood(detectedMood);
    
    // Reset questionnaire state for next time
    resetQuestionnaire();
    
    // Navigate to recommendations
    router.push({ 
      pathname: '/movie/recommendations', 
      params: { 
        mood: detectedMood,
        language: selectedLanguages.join(',')
      } 
    });
  };

  const resetQuestionnaire = () => {
    setMode('select');
    setCurrentQuestion(0);
    setAnswers({});
    fadeAnim.setValue(1);
  };

  const handleBackPress = () => {
    if (currentQuestion === 0) {
      // First question, just go back to mode selection
      resetQuestionnaire();
    } else {
      // Mid-questionnaire, show confirmation
      Alert.alert(
        'Exit Questionnaire?',
        'Your progress will be lost. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Exit', 
            style: 'destructive',
            onPress: resetQuestionnaire 
          }
        ]
      );
    }
  };

  const getLanguageDisplay = () => {
    if (selectedLanguages.length === 0) return '🌐 Select Languages';
    if (selectedLanguages.length === 1) {
      const lang = LANGUAGES.find(l => l.code === selectedLanguages[0]);
      return lang ? `${lang.flag} ${lang.name}` : selectedLanguages[0].toUpperCase();
    }
    return `🌐 ${selectedLanguages.length} Languages Selected`;
  };

  // Questionnaire Mode
  if (mode === 'questionnaire') {
    const question = MOOD_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / MOOD_QUESTIONS.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.questionHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>

        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.questionNumber}>Question {currentQuestion + 1} of {MOOD_QUESTIONS.length}</Text>
          <Text style={styles.questionText}>{question.question}</Text>

          <View style={styles.optionsContainer}>
            {question.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleAnswerSelect(option.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={32} color={option.color} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Selection Mode
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Choose how you want to find your perfect movie</Text>
      </View>

      {/* Language Selection */}
      <TouchableOpacity 
        style={styles.languageSelector} 
        onPress={() => setLanguageModalVisible(true)}
      >
        <View style={styles.languageSelectorContent}>
          <Ionicons name="globe-outline" size={24} color="#9333EA" />
          <Text style={styles.languageSelectorText}>{getLanguageDisplay()}</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>

      {selectedLanguages.length > 0 && (
        <View style={styles.selectedLanguagesContainer}>
          {selectedLanguages.map(code => {
            const lang = LANGUAGES.find(l => l.code === code);
            return lang ? (
              <View key={code} style={styles.languageChip}>
                <Text style={styles.languageChipText}>{lang.flag} {lang.name}</Text>
              </View>
            ) : null;
          })}
        </View>
      )}

      {/* Mode Selection Cards */}
      <View style={styles.modeCards}>
        <TouchableOpacity 
          style={styles.modeCard}
          onPress={() => setMode('questionnaire')}
          activeOpacity={0.8}
        >
          <View style={styles.modeIconContainer}>
            <Ionicons name="help-circle" size={40} color="#9333EA" />
          </View>
          <Text style={styles.modeTitle}>Smart Detection</Text>
          <Text style={styles.modeDescription}>Answer 4 quick questions to find your perfect mood</Text>
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.modeCard}
          onPress={() => {/* Show direct mood grid */}}
          activeOpacity={0.8}
        >
          <View style={styles.modeIconContainer}>
            <Ionicons name="grid" size={40} color="#34D399" />
          </View>
          <Text style={styles.modeTitle}>Quick Pick</Text>
          <Text style={styles.modeDescription}>Already know your mood? Pick it directly</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Mood Grid */}
      <Text style={styles.sectionTitle}>Or pick your mood directly:</Text>
      <View style={styles.moodGrid}>
        {Object.entries(MOOD_RESULTS).map(([moodId, moodData]) => (
          <TouchableOpacity
            key={moodId}
            style={styles.quickMoodCard}
            onPress={() => handleDirectMoodSelect(moodId)}
            activeOpacity={0.7}
          >
            <Ionicons name={moodData.icon as any} size={28} color={moodData.color} />
            <Text style={styles.quickMoodLabel}>{moodData.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.currentMoodContainer}>
        <Text style={styles.currentMoodLabel}>Current Mood:</Text>
        <Text style={styles.currentMoodValue}>{mood.toUpperCase()}</Text>
      </View>

      <TouchableOpacity 
        style={styles.playlistButton}
        onPress={() => router.push({ pathname: '/playlists/[mood]', params: { mood } })}
      >
        <Ionicons name="list" size={20} color="#fff" />
        <Text style={styles.playlistButtonText}>Create Movie Playlist</Text>
      </TouchableOpacity>

      <LanguageSelector
        visible={languageModalVisible}
        selectedLanguages={selectedLanguages}
        onLanguagesChange={setSelectedLanguages}
        onClose={() => setLanguageModalVisible(false)}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
    paddingTop: 60, 
    paddingHorizontal: 16 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#9CA3AF', 
    textAlign: 'center',
    paddingHorizontal: 20
  },
  languageSelector: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D2D2D'
  },
  languageSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  languageSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '500'
  },
  selectedLanguagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  languageChip: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  languageChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  // Mode selection cards
  modeCards: {
    gap: 16,
    marginBottom: 30
  },
  modeCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D2D2D'
  },
  modeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  modeDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20
  },
  recommendedBadge: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 10
  },
  // Quick mood grid
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30
  },
  quickMoodCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D'
  },
  quickMoodLabel: {
    fontSize: 11,
    color: '#fff',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500'
  },
  // Questionnaire styles
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 16
  },
  backButton: {
    padding: 8
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#2D2D2D',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9333EA',
    borderRadius: 4
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  questionNumber: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    textAlign: 'center'
  },
  questionText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 34
  },
  optionsContainer: {
    gap: 16
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2D2D2D'
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1
  },
  // Old styles kept for compatibility
  moodCard: {
    width: '47%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  moodCardSelected: {
    borderColor: '#9333EA',
    backgroundColor: '#2D1B4E'
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center'
  },
  moodDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16
  },
  currentMoodContainer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40
  },
  currentMoodLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4
  },
  currentMoodValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333EA'
  },
  playlistButton: {
    flexDirection: 'row',
    backgroundColor: '#34D399',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  playlistButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});