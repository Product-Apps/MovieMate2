import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useProfileStore } from '../../store/useProfileStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { Card } from '../../components/ui/Card';
import LanguageSelector from '../../components/movie/LanguageSelector';
import { notificationService } from '../../utils/notifications';

const isExpoGo = Constants.appOwnership === 'expo';

interface MoodHistory {
  mood: string;
  date: string;
  movieCount: number;
}

export default function ProfileScreen() {
  const {
    age, gender, language, darkMode,
    setAge, setGender, setLanguage, toggleDarkMode,
    hydrate: hydrateProfile
  } = useProfileStore();

  const { favorites, hydrate: hydrateFavorites } = useFavoritesStore();
  const { watchlist } = useWatchlistStore();
  const { getRecentlyViewed } = useHistoryStore();
  const [moodHistory, setMoodHistory] = useState<MoodHistory[]>([]);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    console.log("Hydrating profile and favorites");
    hydrateProfile();
    hydrateFavorites();
    loadMoodHistory();
    checkNotifications();
  }, []);

  const checkNotifications = async () => {
    const enabled = await notificationService.areNotificationsEnabled();
    setNotificationsEnabled(enabled);
  };

  const toggleNotifications = async (value: boolean) => {
    // Check if notifications are supported
    if (!notificationService.isSupported()) {
      Alert.alert(
        'Not Available in Expo Go',
        'Push notifications require a development build. They will work when you build the app for production.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (value) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        await notificationService.scheduleWeeklyRecommendations();
        Alert.alert('Notifications Enabled', 'You\'ll receive weekly movie recommendations!');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings');
      }
    } else {
      await notificationService.cancelAll();
      await AsyncStorage.setItem('notificationsEnabled', 'false');
      setNotificationsEnabled(false);
      Alert.alert('Notifications Disabled', 'You won\'t receive any notifications');
    }
  };

  const loadMoodHistory = async () => {
    const history = await AsyncStorage.getItem('moodHistory');
    setMoodHistory(history ? JSON.parse(history) : []);
  };

  const clearData = async () => {
    await AsyncStorage.multiRemove(['moodHistory', 'favorites', 'onboardingComplete', 'profile']);
    hydrateProfile();
    hydrateFavorites();
    loadMoodHistory();
    alert('Data cleared successfully!');
  };

  const styles = getStyles(true); // Always use dark mode

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <Text style={styles.title}>Profile</Text>

      <Card>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity style={styles.preferenceItem} onPress={() => setLanguageModalVisible(true)}>
          <Ionicons name="language" size={24} color="#9333EA" />
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Language</Text>
            <Text style={styles.preferenceValue}>{language || 'Not set'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.preferenceItem}>
          <Ionicons name="person" size={24} color="#9333EA" />
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Age</Text>
            <TextInput
              value={age ? String(age) : ''}
              onChangeText={(t) => setAge(t ? Number(t) : null)}
              keyboardType="number-pad"
              placeholder="Enter age"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.preferenceItem}>
          <Ionicons name="male-female" size={24} color="#9333EA" />
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceLabel}>Gender</Text>
            <View style={{ flexDirection: 'row' }}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <TouchableOpacity key={g} onPress={() => setGender(g)} style={[styles.genderButton, gender === g && styles.genderButtonSelected]}>
                  <Text style={styles.genderButtonText}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {!isExpoGo && (
          <View style={styles.preferenceItem}>
            <Ionicons name="notifications" size={24} color="#9333EA" />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceLabel}>Push Notifications</Text>
              <Text style={styles.preferenceSubtext}>Weekly recommendations</Text>
            </View>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"} />
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={30} color="#EF4444" />
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="bookmark" size={30} color="#9333EA" />
            <Text style={styles.statNumber}>{watchlist.length}</Text>
            <Text style={styles.statLabel}>Watchlist</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={30} color="#34D399" />
            <Text style={styles.statNumber}>{getRecentlyViewed(50).length}</Text>
            <Text style={styles.statLabel}>Viewed</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent Mood History</Text>
        {moodHistory.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyMood}>
              <Text style={styles.historyMoodText}>{item.mood}</Text>
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyMovies}>{item.movieCount} movies</Text>
            </View>
          </View>
        ))}
      </Card>

      <TouchableOpacity style={styles.clearButton} onPress={clearData}>
        <Text style={styles.clearButtonText}>Clear All Data</Text>
      </TouchableOpacity>

      <LanguageSelector
        visible={languageModalVisible}
        selectedLanguages={language ? [language] : []}
        onLanguagesChange={(languages) => {
          if (languages.length > 0) {
            setLanguage(languages[0]);
          }
        }}
        onClose={() => setLanguageModalVisible(false)}
        singleSelect={true}  // Enable single selection mode
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (darkMode: boolean) => StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: darkMode ? '#121212' : '#F3F4F6' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: darkMode ? '#fff' : '#000' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: darkMode ? '#fff' : '#000' },
  preferenceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: darkMode ? '#374151' : '#E5E7EB' },
  preferenceText: { flex: 1, marginLeft: 15 },
  preferenceLabel: { fontSize: 16, color: '#9CA3AF' },
  preferenceSubtext: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  preferenceValue: { fontSize: 16, fontWeight: 'bold', color: darkMode ? '#fff' : '#000', marginTop: 2 },
  textInput: { color: darkMode ? '#fff' : '#000', fontSize: 16, minWidth: 60 },
  genderButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#374151', borderRadius: 16, marginRight: 8 },
  genderButtonSelected: { backgroundColor: '#9333EA' },
  genderButtonText: { color: '#fff', fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: darkMode ? '#fff' : '#000', marginVertical: 5 },
  statLabel: { fontSize: 14, color: '#9CA3AF' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkMode ? '#374151' : '#E5E7EB' },
  historyMood: { backgroundColor: '#9333EA', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  historyMoodText: { color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' },
  historyDetails: { flex: 1, marginLeft: 15 },
  historyDate: { fontSize: 14, color: '#9CA3AF' },
  historyMovies: { fontSize: 12, color: '#6B7280' },
  clearButton: { backgroundColor: '#EF4444', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  clearButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});