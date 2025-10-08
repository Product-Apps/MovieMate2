import { ActivityIndicator, View } from 'react-native'

export default function LoadingSpinner() {
  return (
    <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#9333EA" />
    </View>
  )
}


