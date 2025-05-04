import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Task storage key
const TASKS_STORAGE_KEY = '@memorable_tasks';

// Generate a unique ID for tasks and events
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format date (YYYY-MM-DD)
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  const year = d.getFullYear();
  
  return `${year}-${month}-${day}`;
};

// Format time (HH:MM AM/PM)
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

// Get color based on task type
export const getTaskTypeColor = (type, courses = [], courseName) => {
  // First try to get the color from the associated course
  const course = courses.find(c => c.name === courseName);
  if (course) {
    return course.color;
  }
  
  // Fallback colors based on task type
  const typeColors = {
    homework: '#4A6FFF', // Blue
    quiz: '#FFC107', // Amber
    exam: '#F44336', // Red
    essay: '#9C27B0', // Purple
    project: '#2196F3', // Sky Blue
    reading: '#4CAF50', // Green
    presentation: '#FF9800', // Orange
    lab: '#607D8B', // Blue Grey
    default: '#757575', // Grey
  };
  
  return typeColors[type] || typeColors.default;
};

// Save tasks to AsyncStorage
export const saveTasksToStorage = async (tasks) => {
  try {
    const serializedTasks = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, serializedTasks);
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

// Load tasks from AsyncStorage
export const loadTasksFromStorage = async () => {
  try {
    const serializedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    
    if (!serializedTasks) {
      return [];
    }
    
    return JSON.parse(serializedTasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

// Get upcoming assignments (due in the next 7 days) for calendar highlight
export const getTasksAsMarkedDates = (tasks, courses) => {
  const markedDates = {};
  
  tasks.forEach(task => {
    if (!task.completed) {
      const dateString = task.dueDate;
      
      if (!markedDates[dateString]) {
        markedDates[dateString] = { dots: [] };
      }
      
      const color = getTaskTypeColor(task.type, courses, task.courseName);
      
      // Check if we already have a dot with this color
      if (!markedDates[dateString].dots.some(dot => dot.color === color)) {
        markedDates[dateString].dots.push({
          key: task.id,
          color: color,
        });
      }
    }
  });
  
  return markedDates;
};

// Get tasks for a specific date
export const getTasksForDate = (tasks, dateString) => {
  return tasks.filter(task => task.dueDate === dateString);
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
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    
    // Then sort by completion status
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // If dates and completion status are the same, sort by priority
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
};

export default {
  formatDate,
  formatTime,
  parseDate,
  parseTime,
  formatDisplayDate,
  getTaskTypeColor,
  saveTasksToStorage,
  loadTasksFromStorage,
  getTasksAsMarkedDates,
  getTasksForDate,
  generateUniqueId,
  sortTasks,
}; 