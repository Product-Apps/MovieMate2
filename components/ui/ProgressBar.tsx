
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: '#374151',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#9333EA',
  },
});
