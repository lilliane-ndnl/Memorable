import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateUniqueId } from './helpers';

// Task groups storage key
const TASK_GROUPS_STORAGE_KEY = '@memorable_task_groups';

// Default group colors
const GROUP_COLORS = {
  'Midterm Prep': '#9C27B0', // Purple
  'Group Project': '#2196F3', // Blue
  'Reading': '#4CAF50',      // Green
  'Assignments': '#FFC107',  // Amber
  'Labs': '#795548',         // Brown
  'Study Sessions': '#607D8B', // Blue Grey
  'Research': '#FF5722',     // Deep Orange
  'Presentations': '#FF9800', // Orange
  'Papers': '#009688',       // Teal
  'Exams': '#F44336',        // Red
};

// Get default task groups
export const getDefaultTaskGroups = () => {
  return [
    {
      id: 'midterm-prep',
      name: 'Midterm Prep',
      color: GROUP_COLORS['Midterm Prep'],
      tasks: [],
      isDefault: true,
    },
    {
      id: 'group-project',
      name: 'Group Project',
      color: GROUP_COLORS['Group Project'], 
      tasks: [],
      isDefault: true,
    },
    {
      id: 'study-sessions',
      name: 'Study Sessions',
      color: GROUP_COLORS['Study Sessions'],
      tasks: [],
      isDefault: true,
    }
  ];
};

// Create a new task group
export const createTaskGroup = (name, color) => {
  return {
    id: generateUniqueId(),
    name,
    color: color || GROUP_COLORS[name] || '#757575', // Use provided color, or default for name, or gray
    tasks: [],
    isDefault: false,
  };
};

// Save task groups to AsyncStorage
export const saveTaskGroupsToStorage = async (groups) => {
  try {
    const serializedGroups = JSON.stringify(groups);
    await AsyncStorage.setItem(TASK_GROUPS_STORAGE_KEY, serializedGroups);
    return true;
  } catch (error) {
    console.error('Error saving task groups:', error);
    return false;
  }
};

// Load task groups from AsyncStorage
export const loadTaskGroupsFromStorage = async () => {
  try {
    const serializedGroups = await AsyncStorage.getItem(TASK_GROUPS_STORAGE_KEY);
    
    if (!serializedGroups) {
      // Initialize with default groups if none exist
      const defaultGroups = getDefaultTaskGroups();
      await saveTaskGroupsToStorage(defaultGroups);
      return defaultGroups;
    }
    
    return JSON.parse(serializedGroups);
  } catch (error) {
    console.error('Error loading task groups:', error);
    return getDefaultTaskGroups();
  }
};

// Add a task to a group
export const addTaskToGroup = async (taskId, groupId) => {
  try {
    const groups = await loadTaskGroupsFromStorage();
    const groupIndex = groups.findIndex(group => group.id === groupId);
    
    if (groupIndex >= 0) {
      if (!groups[groupIndex].tasks.includes(taskId)) {
        groups[groupIndex].tasks.push(taskId);
        await saveTaskGroupsToStorage(groups);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error adding task to group:', error);
    return false;
  }
};

// Remove a task from a group
export const removeTaskFromGroup = async (taskId, groupId) => {
  try {
    const groups = await loadTaskGroupsFromStorage();
    const groupIndex = groups.findIndex(group => group.id === groupId);
    
    if (groupIndex >= 0) {
      groups[groupIndex].tasks = groups[groupIndex].tasks.filter(id => id !== taskId);
      await saveTaskGroupsToStorage(groups);
    }
    
    return true;
  } catch (error) {
    console.error('Error removing task from group:', error);
    return false;
  }
};

// Get groups that a task belongs to
export const getTaskGroups = async (taskId) => {
  try {
    const groups = await loadTaskGroupsFromStorage();
    return groups.filter(group => group.tasks.includes(taskId));
  } catch (error) {
    console.error('Error getting task groups:', error);
    return [];
  }
};

// Delete a task group
export const deleteTaskGroup = async (groupId) => {
  try {
    const groups = await loadTaskGroupsFromStorage();
    const updatedGroups = groups.filter(group => group.id !== groupId);
    await saveTaskGroupsToStorage(updatedGroups);
    return true;
  } catch (error) {
    console.error('Error deleting task group:', error);
    return false;
  }
};

export default {
  getDefaultTaskGroups,
  createTaskGroup,
  saveTaskGroupsToStorage,
  loadTaskGroupsFromStorage,
  addTaskToGroup,
  removeTaskFromGroup,
  getTaskGroups,
  deleteTaskGroup,
}; 