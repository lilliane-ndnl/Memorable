import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Modal, 
  SafeAreaView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import TaskItem from '../components/TaskItem';
import AddTaskForm from '../components/AddTaskForm';
import HomeworkTask from '../models/HomeworkTask';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  generateUniqueId,
  sortTasks
} from '../utils/helpers';

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'upcoming', 'completed'

  // Load tasks on component mount
  useEffect(() => {
    loadHomeworkTasks();
  }, []);

  // Update filtered tasks when tasks or filter changes
  useEffect(() => {
    applyFilter();
  }, [tasks, filter, searchQuery]);

  const loadHomeworkTasks = async () => {
    const loadedTasks = await loadTasksFromStorage();
    
    // Convert plain objects to HomeworkTask instances
    const taskInstances = loadedTasks.map(task => new HomeworkTask(
      task.id,
      task.title,
      task.courseName,
      task.dueDate,
      task.dueTime,
      task.priority,
      task.notes,
      task.attachments,
      task.isCompleted
    ));
    
    setTasks(taskInstances);
  };

  const applyFilter = () => {
    let result = [...tasks];
    
    // Apply filter
    switch (filter) {
      case 'today':
        result = result.filter(task => task.isDueToday());
        break;
      case 'upcoming':
        result = result.filter(task => !task.isDueToday() && !task.isCompleted);
        break;
      case 'completed':
        result = result.filter(task => task.isCompleted);
        break;
      // 'all' case doesn't filter
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          task.courseName.toLowerCase().includes(query) ||
          task.notes.toLowerCase().includes(query)
      );
    }
    
    // Sort the filtered tasks
    setFilteredTasks(sortTasks(result));
  };

  const handleAddTask = (taskData) => {
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => {
        if (task.id === editingTask.id) {
          return new HomeworkTask(
            task.id,
            taskData.title,
            taskData.courseName,
            taskData.dueDate,
            taskData.dueTime,
            taskData.priority,
            taskData.notes,
            task.attachments,
            task.isCompleted
          );
        }
        return task;
      });
      
      setTasks(updatedTasks);
      saveTasksToStorage(updatedTasks);
    } else {
      // Create new task
      const newTask = new HomeworkTask(
        generateUniqueId(),
        taskData.title,
        taskData.courseName,
        taskData.dueDate,
        taskData.dueTime,
        taskData.priority,
        taskData.notes
      );
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasksToStorage(updatedTasks);
    }
    
    setModalVisible(false);
    setEditingTask(null);
  };

  const handleTaskPress = (task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleCompleteTask = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return new HomeworkTask(
          task.id,
          task.title,
          task.courseName,
          task.dueDate,
          task.dueTime,
          task.priority,
          task.notes,
          task.attachments,
          !task.isCompleted
        );
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homework Tasks</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            setEditingTask(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text 
            style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'today' && styles.filterButtonActive]}
          onPress={() => setFilter('today')}
        >
          <Text 
            style={[styles.filterText, filter === 'today' && styles.filterTextActive]}
          >
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text 
            style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text 
            style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <View style={styles.noTasksContainer}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.noTasksText}>No tasks found</Text>
          <Text style={styles.noTasksSubText}>
            {filter === 'all' 
              ? "Tap the + button to add your first task" 
              : `No tasks in the '${filter}' category`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem 
              task={item}
              onPress={handleTaskPress}
              onComplete={handleCompleteTask}
            />
          )}
          contentContainerStyle={styles.taskList}
        />
      )}
      
      {/* Modal for adding/editing tasks */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AddTaskForm 
              onSubmit={handleAddTask} 
              onCancel={() => {
                setModalVisible(false);
                setEditingTask(null);
              }}
              initialTask={editingTask}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.black,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  contentContainer: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 16,
  },
  searchInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  courseLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTasksText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.gray,
    marginTop: 16,
  },
  noTasksSubText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    ...SHADOWS.medium,
  },
});

export default TasksScreen; 