
import { View, StyleSheet, ViewProps } from 'react-native';

export function Card(props: ViewProps) {
  return <View {...props} style={[styles.card, props.style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
});
