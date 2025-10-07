// components/puzzle/ColorHarmonyPuzzle.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

interface ColorHarmonyPuzzleProps {
  onComplete: () => void;
}

export default function ColorHarmonyPuzzle({ onComplete }: ColorHarmonyPuzzleProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  const handleColorSelect = (color: string) => {
    const newSelected = [...selectedColors, color];
    setSelectedColors(newSelected);
    if (newSelected.length >= 3) {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Color Harmony Puzzle</Text>
      <Text style={styles.instruction}>Select 3 colors that match your mood</Text>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorBox, { backgroundColor: color }]}
            onPress={() => handleColorSelect(color)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  instruction: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  colorBox: { width: 80, height: 80, margin: 10, borderRadius: 10 },
});
