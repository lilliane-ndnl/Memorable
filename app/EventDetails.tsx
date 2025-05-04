import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import AppHeader from '@/components/AppHeader';

export default function EventDetails() {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <EventDetailsScreen />
    </View>
  );
} 