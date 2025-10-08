import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../store/useProfileStore';

export default function TabsLayout() {
  const { darkMode } = useProfileStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: darkMode ? '#9333EA' : '#000',
        tabBarInactiveTintColor: darkMode ? '#6B7280' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: darkMode ? '#1F2937' : '#fff',
          borderTopColor: darkMode ? '#374151' : '#E5E7EB',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ott"
        options={{
          title: 'OTT',
          tabBarIcon: ({ color }) => <Ionicons name="tv" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ color }) => <Ionicons name="happy" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
