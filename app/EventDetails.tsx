import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import EventDetailsScreen from '../screens/EventDetailsScreen';

export default function EventDetailsRoute() {
  const params = useLocalSearchParams();
  return <EventDetailsScreen event={params.event} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 