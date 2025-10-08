// utils/notifications.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Check if running in Expo Go FIRST
const isExpoGo = Constants.appOwnership === 'expo';

// Dynamically import expo-notifications to handle Expo Go limitation
let Notifications: any = null;

// Only try to import if NOT in Expo Go
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    
    // Configure notification behavior only if available
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }
  } catch (error) {
    console.log('Notifications module not available');
  }
}

export const notificationService = {
  // Request permissions
  requestPermissions: async (): Promise<boolean> => {
    // Check if notifications are available
    if (!Notifications || isExpoGo) {
      console.log('Notifications not supported in Expo Go');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#9333EA',
        });
      }

      await AsyncStorage.setItem('notificationsEnabled', 'true');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Check if notifications are enabled
  areNotificationsEnabled: async (): Promise<boolean> => {
    const enabled = await AsyncStorage.getItem('notificationsEnabled');
    return enabled === 'true';
  },

  // Schedule weekly movie recommendations
  scheduleWeeklyRecommendations: async () => {
    if (!Notifications || isExpoGo) return;
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎬 New Movies for You!',
          body: 'Check out this week\'s personalized recommendations',
          data: { type: 'weekly_recommendations' },
        },
        trigger: {
          weekday: 6, // Saturday
          hour: 10,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling weekly notifications:', error);
    }
  },

  // Notify about new movies in favorite genres
  notifyNewMovies: async (movieTitle: string, genre: string) => {
    if (!Notifications || isExpoGo) return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎥 New Movie Alert!',
          body: `${movieTitle} is now available in ${genre}`,
          data: { type: 'new_movie' },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  // Remind about watchlist
  scheduleWatchlistReminder: async (count: number) => {
    if (!Notifications || isExpoGo || count === 0) return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📺 Movies Waiting for You',
          body: `You have ${count} movie${count > 1 ? 's' : ''} in your watchlist`,
          data: { type: 'watchlist_reminder' },
        },
        trigger: {
          seconds: 60 * 60 * 24 * 3, // 3 days from now
        },
      });
    } catch (error) {
      console.error('Error scheduling watchlist reminder:', error);
    }
  },

  // Cancel all notifications
  cancelAll: async () => {
    if (!Notifications || isExpoGo) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Get notification permissions status
  getPermissionStatus: async () => {
    if (!Notifications || isExpoGo) return 'undetermined';
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  },

  // Check if notifications are supported
  isSupported: () => {
    return !isExpoGo && Notifications !== null;
  },
};
