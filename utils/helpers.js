import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Generate a unique ID for tasks and events
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  const year = d.getFullYear();
  
  return `${year}-${month}-${day}`;
};

// Format time to HH:MM AM/PM
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = (`0${d.getMinutes()}`).slice(-2);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours}:${minutes} ${ampm}`;
};

// Parse a formatted date string back to a Date object
export const parseDate = (dateString) => {
  if (!dateString) return new Date();
  return new Date(dateString);
};

// Parse a formatted time string (HH:MM AM/PM) back to a Date object
export const parseTime = (timeString) => {
  if (!timeString) return new Date();
  
  const [time, ampm] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  const date = new Date();
  let hour = hours;
  
  if (ampm === 'PM' && hours < 12) hour += 12;
  if (ampm === 'AM' && hours === 12) hour = 0;
  
  date.setHours(hour, minutes, 0);
  return date;
};

// Format a date for display in the UI (e.g., "Mon, Jan 1")
export const formatDisplayDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

// Save tasks to AsyncStorage
export const saveTasksToStorage = async (tasks) => {
  try {
    const serializedTasks = JSON.stringify(tasks);
    await AsyncStorage.setItem('homework_tasks', serializedTasks);
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
    const serializedTasks = await AsyncStorage.getItem('homework_tasks');
    
    if (!serializedTasks) {
      return [];
    }
    
    return JSON.parse(serializedTasks);
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

export default {
  formatDate,
  formatTime,
  parseDate,
  parseTime,
  formatDisplayDate,
  saveTasksToStorage,
  loadTasksFromStorage,
  generateUniqueId,
  saveEventsToStorage,
  loadEventsFromStorage,
  sortTasks,
}; 