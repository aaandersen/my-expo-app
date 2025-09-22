import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../styles/globalStyles';
import { EventProvider } from '../contexts/EventContext';

export default function RootLayout() {
  return (
    <EventProvider>
      <StatusBar style="dark" backgroundColor={colors.surface} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </EventProvider>
  );
}