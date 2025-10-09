import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileStore } from '../store/useProfileStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { LANGUAGES } from '../constants/Languages';


export default function OnboardingScreen() {
  const { language, setName: setProfileName, setAge: setProfileAge, setGender: setProfileGender, setLanguage: setProfileLanguage, hydrate, darkMode } = useProfileStore();
  const { completeOnboarding } = usePreferencesStore();
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'te');
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');

  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    if (language) {
      setSelectedLanguage(language);
    }
  }, [language])


  const handleGetStarted = async (): Promise<void> => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    const numericAge = parseInt(age, 10)
    if (Number.isNaN(numericAge) || numericAge <= 0) {
      alert('Please enter a valid age')
      return
    }
    if (!gender) {
      alert('Please select gender')
      return
    }
    
    completeOnboarding();
    setProfileName(name);
    setProfileAge(numericAge);
    setProfileGender(gender as any);
    setProfileLanguage(selectedLanguage);

  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#000' : '#fff' }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>Welcome to MovieMate</Text>
        <Text style={[styles.subtitle, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>Find your perfect movie match!</Text>

        <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>Select Your Language:</Text>
        <ScrollView horizontal style={styles.chipScroll}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.chip, selectedLanguage === lang.code && { backgroundColor: '#9333EA' }]}
              onPress={() => setSelectedLanguage(lang.code)}
            >
              <Text style={styles.chipText}>{lang.flag} {lang.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>Your Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, { backgroundColor: darkMode ? '#374151' : '#F3F4F6', color: darkMode ? '#fff' : '#000' }]}
        />

        <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>Your Age</Text>
        <TextInput
          value={age}
          keyboardType="number-pad"
          onChangeText={setAge}
          placeholder="Enter age"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, { backgroundColor: darkMode ? '#374151' : '#F3F4F6', color: darkMode ? '#fff' : '#000' }]}
        />

        <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>Gender</Text>
        <View style={styles.wordContainer}>
          {(['male','female','other'] as const).map((g) => (
            <TouchableOpacity key={g} style={[styles.wordChip, gender === g && { backgroundColor: '#9333EA' }]} onPress={() => setGender(g)}>
              <Text style={styles.chipText}>{g.charAt(0).toUpperCase()+g.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#9333EA' }]}
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#fff' },
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
  input: {
    backgroundColor: '#374151',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
});
