import AsyncStorage from '@react-native-async-storage/async-storage';
import UnifiedTask from '../models/UnifiedTask';

// Storage key
const TASKS_STORAGE_KEY = '@college_calendar_unified_tasks';

/**
 * Generate a unique ID for a task
 */
export const generateTaskId = () => {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Save all tasks to AsyncStorage
 */
export const saveTasksToStorage = async (tasks) => {
  try {
    const tasksJSON = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, tasksJSON);
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

/**
 * Load all tasks from AsyncStorage
 */
export const loadTasksFromStorage = async () => {
  try {
    const tasksJSON = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (!tasksJSON) return [];
    
    // Parse the JSON data
    const tasksData = JSON.parse(tasksJSON);
    
    // Convert plain objects back to UnifiedTask instances
    return tasksData.map(taskData => {
      // Create a new UnifiedTask instance with the stored data
      return new UnifiedTask(taskData);
    });
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

/**
 * Add a new task to storage
 */
export const addTask = async (taskData) => {
  try {
    // Generate ID if not provided
    if (!taskData.id) {
      taskData.id = generateTaskId();
    }
    
    // Create new task instance
    const newTask = new UnifiedTask(taskData);
    
    // Get existing tasks
    const tasks = await loadTasksFromStorage();
    
    // Add new task
    tasks.push(newTask);
    
    // Save updated tasks
    await saveTasksToStorage(tasks);
    
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    return null;
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (taskId, updates) => {
  try {
    // Get existing tasks
    const tasks = await loadTasksFromStorage();
    
    // Find the task to update
    const index = tasks.findIndex(task => task.id === taskId);
    
    if (index === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    // Update the task
    const updatedTask = tasks[index].update(updates);
    
    // Save updated tasks
    await saveTasksToStorage(tasks);
    
    return updatedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId) => {
  try {
    // Get existing tasks
    const tasks = await loadTasksFromStorage();
    
    // Filter out the task to delete
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    // Save updated tasks
    await saveTasksToStorage(updatedTasks);
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

/**
 * Toggle task completion status
 */
export const toggleTaskCompletion = async (taskId) => {
  try {
    // Get existing tasks
    const tasks = await loadTasksFromStorage();
    
    // Find the task to update
    const index = tasks.findIndex(task => task.id === taskId);
    
    if (index === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    // Toggle completion status
    if (tasks[index].isCompleted) {
      tasks[index].markIncomplete();
    } else {
      tasks[index].markComplete();
    }
    
    // Save updated tasks
    await saveTasksToStorage(tasks);
    
    return tasks[index];
  } catch (error) {
    console.error('Error toggling task completion:', error);
    return null;
  }
};

/**
 * Add a sub-task to an existing task
 */
export const addSubTask = async (taskId, subTaskTitle) => {
  try {
    // Get existing tasks
    const tasks = await loadTasksFromStorage();
    
    // Find the task to update
    const index = tasks.findIndex(task => task.id === taskId);
    
    if (index === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    // Add the sub-task
    tasks[index].addSubTask({ title: subTaskTitle });
    
    // Save updated tasks
    await saveTasksToStorage(tasks);
    
    return tasks[index];
  } catch (error) {
    console.error('Error adding sub-task:', error);
    return null;
  }
};

/**
 * Toggle sub-task completion status
 */
export const toggleSubTaskCompletion = async (taskId, subTaskId) => {
  try {
    // Get existing tasks
    const tasks = await loadTasksFromStorage();
    
    // Find the task to update
    const index = tasks.findIndex(task => task.id === taskId);
    
    if (index === -1) {
      throw new Error(`Task with ID ${taskId} not found`);
    }
    
    // Toggle sub-task completion
    tasks[index].toggleSubTaskCompletion(subTaskId);
    
    // Save updated tasks
    await saveTasksToStorage(tasks);
    
    return tasks[index];
  } catch (error) {
    console.error('Error toggling sub-task completion:', error);
    return null;
  }
};

/**
 * Get tasks by course ID
 */
export const getTasksByCourse = async (courseId) => {
  try {
    const tasks = await loadTasksFromStorage();
    return tasks.filter(task => task.courseId === courseId);
  } catch (error) {
    console.error('Error getting tasks by course:', error);
    return [];
  }
};

/**
 * Get tasks due today
 */
export const getTasksDueToday = async () => {
  try {
    const tasks = await loadTasksFromStorage();
    return tasks.filter(task => task.isDueToday());
  } catch (error) {
    console.error('Error getting tasks due today:', error);
    return [];
  }
};

/**
 * Get tasks due this week
 */
export const getTasksDueThisWeek = async () => {
  try {
    const tasks = await loadTasksFromStorage();
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });
  } catch (error) {
    console.error('Error getting tasks due this week:', error);
    return [];
  }
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = async () => {
  try {
    const tasks = await loadTasksFromStorage();
    return tasks.filter(task => task.isOverdue());
  } catch (error) {
    console.error('Error getting overdue tasks:', error);
    return [];
  }
};

/**
 * Get tasks by category
 */
export const getTasksByCategory = async (category) => {
  try {
    const tasks = await loadTasksFromStorage();
    return tasks.filter(task => task.category === category);
  } catch (error) {
    console.error('Error getting tasks by category:', error);
    return [];
  }
};

/**
 * Get completed tasks
 */
export const getCompletedTasks = async () => {
  try {
    const tasks = await loadTasksFromStorage();
    return tasks.filter(task => task.isCompleted);
  } catch (error) {
    console.error('Error getting completed tasks:', error);
    return [];
  }
};

/**
 * Search tasks by title or description
 */
export const searchTasks = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    
    const tasks = await loadTasksFromStorage();
    const lowerQuery = query.toLowerCase();
    
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) || 
      (task.description && task.description.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching tasks:', error);
    return [];
  }
};

/**
 * Group tasks by category
 */
export const groupTasksByCategory = async () => {
  try {
    const tasks = await loadTasksFromStorage();
    
    // Create grouped object
    const groupedTasks = {};
    
    tasks.forEach(task => {
      const category = task.category || 'uncategorized';
      
      if (!groupedTasks[category]) {
        groupedTasks[category] = [];
      }
      
      groupedTasks[category].push(task);
    });
    
    return groupedTasks;
  } catch (error) {
    console.error('Error grouping tasks by category:', error);
    return {};
  }
};

/**
 * Group tasks by course
 */
export const groupTasksByCourse = async () => {
  try {
    const tasks = await loadTasksFromStorage();
    
    // Create grouped object
    const groupedTasks = {};
    
    tasks.forEach(task => {
      const courseId = task.courseId || 'uncategorized';
      
      if (!groupedTasks[courseId]) {
        groupedTasks[courseId] = [];
      }
      
      groupedTasks[courseId].push(task);
    });
    
    return groupedTasks;
  } catch (error) {
    console.error('Error grouping tasks by course:', error);
    return {};
  }
};

/**
 * Get tasks by priority
 */
export const getTasksByPriority = async (priority) => {
  try {
    const tasks = await loadTasksFromStorage();
    return tasks.filter(task => task.priority === priority);
  } catch (error) {
    console.error('Error getting tasks by priority:', error);
    return [];
  }
}; 