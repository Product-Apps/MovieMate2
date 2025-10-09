// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { usePreferencesStore } from '../store/usePreferencesStore';

export function useProtectedRoute(isReady: boolean, loaded: boolean) {
  const { hasCompletedOnboarding } = usePreferencesStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isReady || !loaded) return;

    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace('/onboarding/welcome');
    } else if (hasCompletedOnboarding && inOnboardingGroup) {
      router.replace('/(tabs)');
    }
  }, [isReady, loaded, hasCompletedOnboarding, segments, router]);
}
