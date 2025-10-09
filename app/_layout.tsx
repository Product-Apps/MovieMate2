import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { useProfileStore } from '../store/useProfileStore';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { hasCompletedOnboarding, hydrate: hydratePreferences } = usePreferencesStore();
  const { darkMode, hydrate: hydrateProfile } = useProfileStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    Promise.all([hydratePreferences(), hydrateProfile()]).then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (!isReady || !loaded) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding/welcome');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isReady, loaded, hasCompletedOnboarding, segments]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: darkMode ? '#000' : '#fff' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="onboarding/preferences" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movie/[id]" />
        <Stack.Screen name="movie/recommendations" />
        <Stack.Screen name="playlists/[mood]" />
        <Stack.Screen name="tv/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
