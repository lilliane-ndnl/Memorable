import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../constants/theme';
import AddTaskForm from '../components/AddTaskForm';
import { loadTasksFromStorage, saveTasksToStorage, formatDisplayDate } from '../utils/helpers';
import { loadCoursesFromStorage } from '../utils/courseHelpers';

// Icons for assignment types
const ASSIGNMENT_ICONS = {
  essay: 'document-text-outline',
  quiz: 'help-circle-outline',
  exam: 'school-outline',
  reading: 'book-outline',
  project: 'construct-outline',
  presentation: 'easel-outline',
  homework: 'create-outline',
  lab: 'flask-outline',
  paper: 'newspaper-outline',
  discussion: 'chatbubbles-outline',
  other: 'file-tray-outline',
};

const TasksScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'completed'

  useEffect(() => {
    loadAllData();
  }, []);

  // When tasks or filter changes, update filtered tasks
  useEffect(() => {
    filterTasks(filter);
  }, [tasks, filter]);

  const loadAllData = async () => {
    const loadedTasks = await loadTasksFromStorage();
    const loadedCourses = await loadCoursesFromStorage();
    setTasks(loadedTasks);
    setCourses(loadedCourses);
  };

  const filterTasks = (filterType) => {
    setFilter(filterType);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    let filtered = [...tasks];
    
    switch (filterType) {
      case 'today':
        filtered = tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
        break;
      case 'week':
        filtered = tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate >= today && taskDate <= nextWeek;
        });
        break;
      case 'completed':
        filtered = tasks.filter(task => task.completed);
        break;
      case 'all':
      default:
        // Already set to all tasks
        break;
    }
    
    // Sort by due date (ascending)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    });
    
    setFilteredTasks(filtered);
  };

  const handleAddTask = (taskData) => {
    const newTask = {
      id: editingTask?.id || Date.now().toString(),
      ...taskData,
      completed: editingTask?.completed || false,
      type: taskData.type || 'homework',
    };
    
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? newTask : task
      );
      setTasks(updatedTasks);
      saveTasksToStorage(updatedTasks);
    } else {
      // Add new task
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasksToStorage(updatedTasks);
    }
    
    setModalVisible(false);
    setEditingTask(null);
  };

  const handleToggleComplete = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    saveTasksToStorage(updatedTasks);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
            saveTasksToStorage(updatedTasks);
          },
          style: "destructive"
        }
      ]
    );
  };

  // Helper to get color for a course
  const getCourseColor = (courseName) => {
    const course = courses.find(c => c.name === courseName);
    return course?.color || COLORS.primary;
  };

  // Helper to get the right icon for a task
  const getTaskIcon = (task) => {
    return ASSIGNMENT_ICONS[task.type] || ASSIGNMENT_ICONS.homework;
  };

  // Group tasks by due date for better organization
  const groupTasksByDate = () => {
    const grouped = {};
    
    filteredTasks.forEach(task => {
      if (!grouped[task.dueDate]) {
        grouped[task.dueDate] = [];
      }
      grouped[task.dueDate].push(task);
    });
    
    // Convert to array format for FlatList
    return Object.entries(grouped).map(([date, tasks]) => ({
      date,
      tasks,
    }));
  };

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { borderLeftColor: getCourseColor(item.courseName) },
        item.completed && styles.completedTask
      ]}
      onPress={() => handleEditTask(item)}
    >
      <TouchableOpacity
        style={[
          styles.completeButton,
          item.completed && styles.completedButton
        ]}
        onPress={() => handleToggleComplete(item.id)}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={18} color={COLORS.white} />
        )}
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          <Ionicons name={getTaskIcon(item)} size={20} color={getCourseColor(item.courseName)} />
        </View>
        
        <View style={styles.taskDetails}>
          <Text style={styles.courseText}>{item.courseName}</Text>
          <Text style={styles.timeText}>{item.dueTime}</Text>
        </View>
        
        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteTask(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDateGroup = ({ item }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatDisplayDate(item.date)}</Text>
        <View style={styles.dateLine} />
      </View>
      
      {item.tasks.map(task => (
        <View key={task.id}>
          {renderTaskItem({ item: task })}
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color={COLORS.primary} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No Tasks Yet</Text>
      <Text style={styles.emptyText}>
        Add your homework and assignments to keep track of everything
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => {
          setEditingTask(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.emptyButtonText}>Add Your First Task</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignments</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setEditingTask(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => filterTasks('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'today' && styles.activeFilterButton
            ]}
            onPress={() => filterTasks('today')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'today' && styles.activeFilterText
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'week' && styles.activeFilterButton
            ]}
            onPress={() => filterTasks('week')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'week' && styles.activeFilterText
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'completed' && styles.activeFilterButton
            ]}
            onPress={() => filterTasks('completed')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'completed' && styles.activeFilterText
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {filteredTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupTasksByDate()}
          keyExtractor={(item) => item.date}
          renderItem={renderDateGroup}
          contentContainerStyle={styles.list}
        />
      )}
      
      {/* Add/Edit Task Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
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
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.lightGray,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeFilterText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    ...SHADOWS.light,
  },
  completedTask: {
    backgroundColor: COLORS.lightGray + '50',
    borderLeftWidth: 0,
  },
  taskContent: {
    flex: 1,
    marginLeft: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  taskDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  courseText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  notes: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  completeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    ...SHADOWS.light,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 50,
    ...SHADOWS.dark,
  },
});

export default TasksScreen; 