import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EventProvider } from '../contexts/EventContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <EventProvider>
        <StatusBar 
          style="dark" 
          backgroundColor="#FFFFFF" 
          translucent 
        />
        {/* 🎨 Ændre backgroundColor til din ønskede farve:
            backgroundColor="#FF6B6B"  // Rød
            backgroundColor="#4ECDC4"  // Teal  
            backgroundColor="#45B7D1"  // Blå
            backgroundColor="#96CEB4"  // Mint
            backgroundColor="#FECA57"  // Gul
            backgroundColor="#FF9FF3"  // Pink
            backgroundColor="#5F27CD"  // Lilla
            backgroundColor="#000000"  // Sort
        */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </EventProvider>
    </SafeAreaProvider>
  );
}