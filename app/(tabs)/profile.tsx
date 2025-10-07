import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const languages: string[] = ['Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'English', 'Spanish', 'French'];
const genres: string[] = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation'];
const streamingServices: string[] = ['Netflix', 'Prime Video', 'Disney+', 'Hotstar', 'HBO Max', 'Apple TV+'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStreaming, setSelectedStreaming] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async (): Promise<void> => {
    const lang = await AsyncStorage.getItem('language');
    const genresStr = await AsyncStorage.getItem('genres');
    const streamingStr = await AsyncStorage.getItem('streaming');
    
    if (lang) setSelectedLanguage(lang);
    if (genresStr) setSelectedGenres(JSON.parse(genresStr));
    if (streamingStr) setSelectedStreaming(JSON.parse(streamingStr));
  };

  const savePreferences = async (): Promise<void> => {
    await AsyncStorage.setItem('language', selectedLanguage);
    await AsyncStorage.setItem('genres', JSON.stringify(selectedGenres));
    await AsyncStorage.setItem('streaming', JSON.stringify(selectedStreaming));
  };

  const toggleGenre = (genre: string): void => {
    let newGenres = [...selectedGenres];
    if (newGenres.includes(genre)) {
      newGenres = newGenres.filter(g => g !== genre);
    } else {
      newGenres.push(genre);
    }
    setSelectedGenres(newGenres);
    savePreferences();
  };

  const toggleStreaming = (service: string): void => {
    let newServices = [...selectedStreaming];
    if (newServices.includes(service)) {
      newServices = newServices.filter(s => s !== service);
    } else {
      newServices.push(service);
    }
    setSelectedStreaming(newServices);
    savePreferences();
  };

  const showPremiumDialog = (): void => {
    alert('Upgrade to Premium for $1.99/month\n\nFeatures:\n• Ad-free experience\n• Unlimited mood saves\n• Full mood history\n• Advanced recommendations\n• Priority support');
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={[styles.profileName, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Movie Enthusiast
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Language Preference
        </Text>
        <View style={styles.chipContainer}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang}
              style={[styles.chip, selectedLanguage === lang && { backgroundColor: '#9333EA' }]}
              onPress={() => {
                setSelectedLanguage(lang);
                savePreferences();
              }}
            >
              <Text style={[styles.chipText, selectedLanguage === lang && { color: '#fff' }]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Favorite Genres
        </Text>
        <View style={styles.chipContainer}>
          {genres.map(genre => (
            <TouchableOpacity
              key={genre}
              style={[styles.chip, selectedGenres.includes(genre) && { backgroundColor: '#9333EA' }]}
              onPress={() => toggleGenre(genre)}
            >
              <Text style={[styles.chipText, selectedGenres.includes(genre) && { color: '#fff' }]}>
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          Streaming Services
        </Text>
        <View style={styles.chipContainer}>
          {streamingServices.map(service => (
            <TouchableOpacity
              key={service}
              style={[styles.chip, selectedStreaming.includes(service) && { backgroundColor: '#9333EA' }]}
              onPress={() => toggleStreaming(service)}
            >
              <Text style={[styles.chipText, selectedStreaming.includes(service) && { color: '#fff' }]}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingsItem}>
          <Ionicons name="moon" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          <Text style={[styles.settingsText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Dark Mode
          </Text>
          <TouchableOpacity onPress={() => setDarkMode(!darkMode)}>
            <View style={[styles.switch, darkMode && styles.switchActive]}>
              <View style={[styles.switchThumb, darkMode && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.premiumItem} onPress={showPremiumDialog}>
          <Ionicons name="star" size={24} color="#FCD34D" />
          <Text style={styles.premiumText}>Upgrade to Premium</Text>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#9333EA', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  profileName: { fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: '#374151', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  chipText: { color: '#D1D5DB', fontSize: 14 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#374151', marginTop: 20 },
  settingsText: { flex: 1, marginLeft: 15, fontSize: 16 },
  switch: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#374151', justifyContent: 'center', padding: 3 },
  switchActive: { backgroundColor: '#9333EA' },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  switchThumbActive: { alignSelf: 'flex-end' },
  premiumItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#374151' },
  premiumText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#FCD34D', fontWeight: '600' },
});
