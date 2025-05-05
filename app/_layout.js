import { Stack } from 'expo-router';
import { Image } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.text,
        headerTitle: () => (
          <Image 
            source={require('../assets/images/App Logo - Transparent.png')}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
        ),
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tasks" options={{ headerShown: false }} />
      <Stack.Screen name="calendar" options={{ headerShown: false }} />
      <Stack.Screen name="courses" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
} 