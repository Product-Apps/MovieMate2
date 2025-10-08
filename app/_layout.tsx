import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { usePreferencesStore } from '../store/usePreferencesStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { hasCompletedOnboarding, hydrate } = usePreferencesStore();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    hydrate().then(() => setIsReady(true));
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/welcome" />
      <Stack.Screen name="onboarding/preferences" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movie/[id]" />
      <Stack.Screen name="movie/recommendations" />
      <Stack.Screen name="playlists/[mood]" />
      <Stack.Screen name="tv/[id]" />
    </Stack>
  );
}
