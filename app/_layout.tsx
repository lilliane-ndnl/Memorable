import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppHeader from '@/components/AppHeader';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <AppHeader />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="EventDetails" 
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
