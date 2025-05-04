import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import EventDetailsScreen from '../screens/EventDetailsScreen';

export default function EventDetails() {
  return (
    <View style={{ flex: 1 }}>
      <EventDetailsScreen />
    </View>
  );
} 