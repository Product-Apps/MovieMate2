// components/mood/QuickMoodPicker.tsx
import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MoodOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

interface QuickMoodPickerProps {
  moods: Record<string, MoodOption>;
  onSelect: (moodId: string) => void;
  selectedMood?: string;
}

// Color harmony palettes for each mood
const getColorHarmony = (baseColor: string): string[] => {
  const colorMap: Record<string, string[]> = {
    '#FCD34D': ['#FCD34D', '#FBBF24', '#F59E0B', '#FEF3C7'], // Happy - yellows
    '#60A5FA': ['#60A5FA', '#3B82F6', '#2563EB', '#DBEAFE'], // Sad - blues
    '#F87171': ['#F87171', '#EF4444', '#DC2626', '#FEE2E2'], // Excited - reds
    '#34D399': ['#34D399', '#10B981', '#059669', '#D1FAE5'], // Calm - greens
    '#A78BFA': ['#A78BFA', '#8B5CF6', '#7C3AED', '#EDE9FE'], // Adventurous - purples
    '#FB7185': ['#FB7185', '#F43F5E', '#E11D48', '#FFE4E6'], // Romantic - pinks
    '#FBBF24': ['#FBBF24', '#F59E0B', '#D97706', '#FEF3C7'], // Thoughtful - amber
    '#EF4444': ['#EF4444', '#DC2626', '#B91C1C', '#FEE2E2'], // Scared - dark reds
  };
  return colorMap[baseColor] || [baseColor, baseColor, baseColor, baseColor];
};

export default function QuickMoodPicker({ 
  moods, 
  onSelect, 
  selectedMood 
}: QuickMoodPickerProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.instruction}>
        Pick the color that matches your mood
      </Text>
      
      <View style={styles.moodList}>
        {Object.entries(moods).map(([moodId, moodData]) => {
          const colors = getColorHarmony(moodData.color);
          return (
            <Pressable
              key={moodId}
              style={[
                styles.moodCard,
                selectedMood === moodId && styles.selectedMood,
              ]}
              onPress={() => onSelect(moodId)}
            >
              <View style={styles.moodInfo}>
                <Ionicons name={moodData.icon as any} size={28} color={moodData.color} />
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === moodId && styles.selectedLabel,
                  ]}>
                    {moodData.label}
                  </Text>
                  <Text style={styles.moodDescription}>{moodData.description}</Text>
                </View>
              </View>
              
              <View style={styles.colorSwatches}>
                {colors.map((color, index) => (
                  <View key={index} style={[styles.swatch, { backgroundColor: color }]} />
                ))}
              </View>
              
              {selectedMood === moodId && (
                <View style={[styles.checkmark, { backgroundColor: moodData.color }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  instruction: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
  },
  moodList: {
    gap: 12,
  },
  moodCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2D2D2D',
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
  },
  selectedMood: {
    borderColor: '#9333EA',
    backgroundColor: '#2D1B4E',
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  selectedLabel: {
    color: '#9333EA',
  },
  moodDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  colorSwatches: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
