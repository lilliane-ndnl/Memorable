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
import { loadTaskGroupsFromStorage, saveTaskGroupsToStorage } from '../utils/groupHelpers';

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

// Task type categories for visual hierarchy
const TASK_CATEGORIES = {
  LECTURE: ['lecture'],
  STUDY: ['reading', 'study', 'discussion', 'study-sessions'],
  ASSESSMENT: ['exam', 'quiz', 'test'],
  ASSIGNMENT: ['homework', 'essay', 'paper', 'project', 'presentation', 'lab', 'other'],
};

const TasksScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'completed', 'grouped'
  const [groupFilter, setGroupFilter] = useState(null); // null or groupId
  const [groupByOption, setGroupByOption] = useState('date'); // 'date', 'course', 'group', 'type'

  useEffect(() => {
    loadAllData();
  }, []);

  // When tasks, filter or grouping option changes, update filtered tasks
  useEffect(() => {
    filterTasks(filter);
  }, [tasks, filter, groupByOption, groupFilter]);

  const loadAllData = async () => {
    const loadedTasks = await loadTasksFromStorage();
    const loadedCourses = await loadCoursesFromStorage();
    const loadedGroups = await loadTaskGroupsFromStorage();
    setTasks(loadedTasks);
    setCourses(loadedCourses);
    setGroups(loadedGroups);
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
      case 'grouped':
        // Only show tasks in the selected group
        if (groupFilter) {
          const group = groups.find(g => g.id === groupFilter);
          if (group) {
            filtered = tasks.filter(task => 
              group.tasks.includes(task.id)
            );
          }
        }
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
      
      // If the task has a group, add it to that group
      if (newTask.groupId) {
        updateTaskInGroups(newTask.id, newTask.groupId);
      }
      
      // If we're grouping by course, automatically add to course group
      if (groupByOption === 'course' && newTask.courseName) {
        const courseGroup = groups.find(g => g.name === newTask.courseName);
        if (courseGroup) {
          updateTaskInGroups(newTask.id, courseGroup.id);
        } else {
          // Create a new course group if it doesn't exist
          createCourseGroup(newTask.courseName, newTask.id);
        }
      }
    }
    
    setModalVisible(false);
    setEditingTask(null);
  };

  const updateTaskInGroups = async (taskId, groupId) => {
    const updatedGroups = [...groups];
    const groupIndex = updatedGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex >= 0) {
      if (!updatedGroups[groupIndex].tasks.includes(taskId)) {
        updatedGroups[groupIndex].tasks.push(taskId);
        setGroups(updatedGroups);
        await saveTaskGroupsToStorage(updatedGroups);
      }
    }
  };
  
  const createCourseGroup = async (courseName, taskId) => {
    // Find course color
    const course = courses.find(c => c.name === courseName);
    const courseColor = course?.color || COLORS.primary;
    
    // Create a new group for this course
    const newGroup = {
      id: `course-${Date.now().toString()}`,
      name: courseName,
      color: courseColor,
      tasks: [taskId],
      isDefault: false,
      isCourseGroup: true,
    };
    
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    await saveTaskGroupsToStorage(updatedGroups);
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
            
            // Also remove the task from any groups
            const updatedGroups = groups.map(group => ({
              ...group,
              tasks: group.tasks.filter(taskId => taskId !== id)
            }));
            setGroups(updatedGroups);
            saveTaskGroupsToStorage(updatedGroups);
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
  
  // Helper to determine task category for visual hierarchy
  const getTaskCategory = (task) => {
    const type = task.type.toLowerCase();
    
    for (const [category, types] of Object.entries(TASK_CATEGORIES)) {
      if (types.includes(type)) {
        return category;
      }
    }
    
    // Default to ASSIGNMENT if no match
    return 'ASSIGNMENT';
  };
  
  // Helper to get category style
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'LECTURE':
        return styles.lectureTask;
      case 'STUDY':
        return styles.studyTask;
      case 'ASSESSMENT':
        return styles.assessmentTask;
      case 'ASSIGNMENT':
      default:
        return styles.assignmentTask;
    }
  };

  // Group tasks by the selected option
  const groupTasks = () => {
    if (filteredTasks.length === 0) {
      return [];
    }

    const grouped = {};
    
    switch (groupByOption) {
      case 'course':
        // Group by course
        filteredTasks.forEach(task => {
          const key = task.courseName || 'Uncategorized';
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(task);
        });
        break;
      
      case 'group':
        // Group by custom group
        // First, create an "Ungrouped" category
        grouped['Ungrouped'] = filteredTasks.filter(task => !task.groupId);
        
        // Then add tasks to their respective groups
        groups.forEach(group => {
          const groupTasks = filteredTasks.filter(task => 
            task.groupId === group.id
          );
          
          if (groupTasks.length > 0) {
            grouped[group.name] = groupTasks;
          }
        });
        break;
      
      case 'type':
        // Group by task type/category
        filteredTasks.forEach(task => {
          const category = getTaskCategory(task);
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(task);
        });
        break;
      
      case 'date':
      default:
        // Group by due date (default)
        filteredTasks.forEach(task => {
          if (!grouped[task.dueDate]) {
            grouped[task.dueDate] = [];
          }
          grouped[task.dueDate].push(task);
        });
        break;
    }
    
    // Convert to array format for FlatList
    return Object.entries(grouped).map(([label, tasks]) => ({
      label,
      tasks,
      isDate: groupByOption === 'date', // Special case for date formatting
    }));
  };

  const renderTaskItem = ({ item }) => {
    const taskCategory = getTaskCategory(item.tasks[0]);
    const categoryStyle = getCategoryStyle(taskCategory);
    
    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          categoryStyle,
          { borderLeftColor: getCourseColor(item.tasks[0].courseName) },
          item.tasks[0].completed && styles.completedTask
        ]}
        onPress={() => handleEditTask(item.tasks[0])}
      >
        <TouchableOpacity
          style={[
            styles.completeButton,
            item.tasks[0].completed && styles.completedButton
          ]}
          onPress={() => handleToggleComplete(item.tasks[0].id)}
        >
          {item.tasks[0].completed && (
            <Ionicons name="checkmark" size={18} color={COLORS.white} />
          )}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, item.tasks[0].completed && styles.completedText]}>
              {item.tasks[0].title}
            </Text>
            <Ionicons name={getTaskIcon(item.tasks[0])} size={20} color={getCourseColor(item.tasks[0].courseName)} />
          </View>
          
          <View style={styles.taskDetails}>
            <Text style={styles.courseText}>{item.tasks[0].courseName}</Text>
            <Text style={styles.timeText}>{item.tasks[0].dueTime}</Text>
          </View>
          
          {/* Show group tag if task is in a group */}
          {item.tasks[0].groupId && (
            <View style={styles.taskGroupInfo}>
              {groups.filter(g => g.id === item.tasks[0].groupId).map(group => (
                <View 
                  key={group.id} 
                  style={[styles.groupTag, { backgroundColor: group.color + '30' }]}
                >
                  <Text style={[styles.groupTagText, { color: group.color }]}>
                    {group.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {item.tasks[0].notes && (
            <Text style={styles.notes} numberOfLines={2}>{item.tasks[0].notes}</Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.tasks[0].id)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderGroupHeader = ({ item }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateHeader}>
        {item.isDate ? (
          <Text style={styles.dateText}>{formatDisplayDate(item.label)}</Text>
        ) : (
          <Text style={styles.groupHeaderText}>{item.label}</Text>
        )}
        <View style={styles.dateLine} />
      </View>
      
      {item.tasks.map(task => (
        <View key={task.id}>
          {renderTaskItem({ item: { tasks: [task] } })}
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
  
  // Render group filter pills when in "grouped" filter
  const renderGroupFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.groupFiltersContainer}
    >
      <TouchableOpacity
        style={[
          styles.groupFilterPill,
          !groupFilter && styles.activeGroupFilterPill
        ]}
        onPress={() => setGroupFilter(null)}
      >
        <Text style={[
          styles.groupFilterText,
          !groupFilter && styles.activeGroupFilterText
        ]}>All Groups</Text>
      </TouchableOpacity>
      
      {groups.map(group => (
        <TouchableOpacity
          key={group.id}
          style={[
            styles.groupFilterPill,
            { borderColor: group.color },
            groupFilter === group.id && {
              backgroundColor: group.color + '30',
              borderColor: group.color,
            }
          ]}
          onPress={() => setGroupFilter(group.id)}
        >
          <View style={[styles.colorDot, { backgroundColor: group.color }]} />
          <Text style={[
            styles.groupFilterText,
            groupFilter === group.id && { color: group.color }
          ]}>{group.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
              filter === 'grouped' && styles.activeFilterButton
            ]}
            onPress={() => filterTasks('grouped')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'grouped' && styles.activeFilterText
              ]}
            >
              Groups
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
      
      {/* Group by options */}
      <View style={styles.groupByContainer}>
        <Text style={styles.groupByLabel}>Group by:</Text>
        <View style={styles.groupByButtons}>
          <TouchableOpacity
            style={[
              styles.groupByButton,
              groupByOption === 'date' && styles.activeGroupByButton
            ]}
            onPress={() => setGroupByOption('date')}
          >
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={groupByOption === 'date' ? COLORS.white : COLORS.primary} 
            />
            <Text 
              style={[
                styles.groupByText,
                groupByOption === 'date' && styles.activeGroupByText
              ]}
            >
              Date
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.groupByButton,
              groupByOption === 'course' && styles.activeGroupByButton
            ]}
            onPress={() => setGroupByOption('course')}
          >
            <Ionicons 
              name="school-outline" 
              size={16} 
              color={groupByOption === 'course' ? COLORS.white : COLORS.primary} 
            />
            <Text 
              style={[
                styles.groupByText,
                groupByOption === 'course' && styles.activeGroupByText
              ]}
            >
              Course
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.groupByButton,
              groupByOption === 'group' && styles.activeGroupByButton
            ]}
            onPress={() => setGroupByOption('group')}
          >
            <Ionicons 
              name="folder-outline" 
              size={16} 
              color={groupByOption === 'group' ? COLORS.white : COLORS.primary} 
            />
            <Text 
              style={[
                styles.groupByText,
                groupByOption === 'group' && styles.activeGroupByText
              ]}
            >
              Group
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.groupByButton,
              groupByOption === 'type' && styles.activeGroupByButton
            ]}
            onPress={() => setGroupByOption('type')}
          >
            <Ionicons 
              name="apps-outline" 
              size={16} 
              color={groupByOption === 'type' ? COLORS.white : COLORS.primary} 
            />
            <Text 
              style={[
                styles.groupByText,
                groupByOption === 'type' && styles.activeGroupByText
              ]}
            >
              Type
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Group filters (only shown when filter is "grouped") */}
      {filter === 'grouped' && renderGroupFilters()}
      
      {filteredTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupTasks()}
          keyExtractor={(item) => item.label}
          renderItem={renderGroupHeader}
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
  groupHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
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
  // Group by styles
  groupByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  groupByLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
    marginRight: 10,
  },
  groupByButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  groupByButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeGroupByButton: {
    backgroundColor: COLORS.primary,
  },
  groupByText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  activeGroupByText: {
    color: COLORS.white,
  },
  // Task category styles for visual hierarchy
  lectureTask: {
    borderRightWidth: 4,
    borderRightColor: '#9C27B0', // Purple for lectures
  },
  studyTask: {
    borderRightWidth: 4,
    borderRightColor: '#009688', // Teal for study sessions
  },
  assessmentTask: {
    borderRightWidth: 4,
    borderRightColor: '#F44336', // Red for assessments
  },
  assignmentTask: {
    // Default style (no additional styling needed)
  },
  // Group tag styles
  taskGroupInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
  },
  groupTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  groupTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Group filter styles
  groupFiltersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  groupFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  activeGroupFilterPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  groupFilterText: {
    fontSize: 12,
    color: COLORS.text,
  },
  activeGroupFilterText: {
    color: COLORS.white,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});

export default TasksScreen; 