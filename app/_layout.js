import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../styles/globalStyles';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.surface} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}