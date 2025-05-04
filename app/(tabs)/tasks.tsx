import React from 'react';
import { StyleSheet } from 'react-native';
import TasksScreen from '../../screens/TasksScreen';

export default function TasksTab() {
  return <TasksScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 