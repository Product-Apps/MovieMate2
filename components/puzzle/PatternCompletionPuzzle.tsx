// components/puzzle/PatternCompletionPuzzle.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

interface PatternCompletionPuzzleProps {
  onComplete: () => void;
}

export default function PatternCompletionPuzzle({ onComplete }: PatternCompletionPuzzleProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const pattern = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleSelect = (num: number) => {
    const newSelected = [...selected, num];
    setSelected(newSelected);
    if (newSelected.length >= 4) {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pattern Completion</Text>
      <Text style={styles.instruction}>Tap 4 squares to complete the pattern</Text>
      <View style={styles.grid}>
        {pattern.map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.box, selected.includes(num) && styles.selectedBox]}
            onPress={() => handleSelect(num)}
          >
            <Text style={styles.boxText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', marginTop: 30 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  instruction: { fontSize: 14, color: '#9CA3AF', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 280 },
  box: { width: 80, height: 80, margin: 5, backgroundColor: '#1F2937', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  selectedBox: { backgroundColor: '#9333EA' },
  boxText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
