import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Generate a unique ID for tasks and events
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// Format time to HH:MM
export const formatTime = (date) => {
  const d = new Date(date);
  const hours = `${d.getHours()}`.padStart(2, '0');
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Save tasks to AsyncStorage
export const saveTasksToStorage = async (tasks) => {
  try {
    await AsyncStorage.setItem('homework_tasks', JSON.stringify(tasks));
    return true;
  } catch (error) {
    Alert.alert('Error', 'Failed to save tasks');
    console.error('Error saving tasks: ', error);
    return false;
  }
};

// Load tasks from AsyncStorage
export const loadTasksFromStorage = async () => {
  try {
    const tasks = await AsyncStorage.getItem('homework_tasks');
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    Alert.alert('Error', 'Failed to load tasks');
    console.error('Error loading tasks: ', error);
    return [];
  }
};

// Save calendar events to AsyncStorage
export const saveEventsToStorage = async (events) => {
  try {
    await AsyncStorage.setItem('calendar_events', JSON.stringify(events));
    return true;
  } catch (error) {
    Alert.alert('Error', 'Failed to save events');
    console.error('Error saving events: ', error);
    return false;
  }
};

// Load calendar events from AsyncStorage
export const loadEventsFromStorage = async () => {
  try {
    const events = await AsyncStorage.getItem('calendar_events');
    return events ? JSON.parse(events) : {};
  } catch (error) {
    Alert.alert('Error', 'Failed to load events');
    console.error('Error loading events: ', error);
    return {};
  }
};

// Sort tasks by due date and priority
export const sortTasks = (tasks) => {
  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    // First sort by due date
    const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
    const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    
    // If dates are the same, sort by priority
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
}; 