import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PuzzleOption } from '../../types';

interface PatternCompletionPuzzleProps {
  options: PuzzleOption[];
  onSelect: (optionId: string) => void;
  selectedOption?: string;
}

export default function PatternCompletionPuzzle({ options, onSelect, selectedOption }: PatternCompletionPuzzleProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[styles.optionCard, selectedOption === option.id && styles.selectedCard]}
          onPress={() => onSelect(option.id)}
        >
          <Text style={styles.optionLabel}>{option.label}</Text>
          <Text style={styles.optionText}>{option.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  optionCard: {
    width: '100%',
    padding: 20,
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
  optionText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});