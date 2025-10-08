import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PuzzleOption } from '../../types';

interface ColorHarmonyPuzzleProps {
  options: PuzzleOption[];
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export default function ColorHarmonyPuzzle({ options, onSelect, selectedOption }: ColorHarmonyPuzzleProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[styles.optionCard, selectedOption === option.id && styles.selectedCard]}
          onPress={() => onSelect(option.id)}
        >
          <Text style={styles.optionLabel}>{option.label}</Text>
          <View style={styles.colorSwatches}>
            {option.colors?.map((color) => (
              <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  optionCard: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#374151',
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#9333EA',
  },
  optionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  colorSwatches: {
    flexDirection: 'row',
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});