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
import { COLORS, SIZES } from '../constants/theme';
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
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text 
            style={[styles.filterText, filter === 'all' && styles.activeFilterText]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'today' && styles.activeFilterTab]}
          onPress={() => setFilter('today')}
        >
          <Text 
            style={[styles.filterText, filter === 'today' && styles.activeFilterText]}
          >
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'upcoming' && styles.activeFilterTab]}
          onPress={() => setFilter('upcoming')}
        >
          <Text 
            style={[styles.filterText, filter === 'upcoming' && styles.activeFilterText]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'completed' && styles.activeFilterTab]}
          onPress={() => setFilter('completed')}
        >
          <Text 
            style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No tasks found</Text>
          <Text style={styles.emptySubText}>
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
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.medium,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerButton: {
    padding: SIZES.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SIZES.medium,
    borderRadius: SIZES.base,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SIZES.small,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  activeFilterText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  taskList: {
    paddingHorizontal: SIZES.medium,
    paddingBottom: SIZES.extraLarge,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIZES.medium,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginTop: SIZES.small,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.large,
    maxHeight: '80%',
  },
});

export default TasksScreen; 