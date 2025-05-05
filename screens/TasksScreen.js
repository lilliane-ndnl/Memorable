import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import GradientButton from '../components/GradientButton';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { loadCoursesFromStorage } from '../utils/courseHelpers';
import {
    addTask,
    deleteTask,
    loadTasksFromStorage,
    toggleSubTaskCompletion,
    toggleTaskCompletion,
    updateTask
} from '../utils/taskHelpers';

// Task category filters
const FILTERS = {
  ALL: 'all',
  TODAY: 'today',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
};

// Sort options
const SORT_TYPES = {
  DUE_DATE_ASC: 'dueDate-asc',
  DUE_DATE_DESC: 'dueDate-desc',
  PRIORITY_HIGH: 'priority-high',
  PRIORITY_LOW: 'priority-low',
  ALPHABETICAL: 'alphabetical'
};

// Group options
const GROUP_TYPES = {
  NONE: 'none',
  COURSE: 'course',
  PRIORITY: 'priority',
  CATEGORY: 'category',
  DUE_DATE: 'dueDate'
};

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(FILTERS.ALL);
  const [currentSort, setCurrentSort] = useState(SORT_TYPES.DUE_DATE_ASC);
  const [currentGroup, setCurrentGroup] = useState(GROUP_TYPES.NONE);
  const [groupedTasks, setGroupedTasks] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Load tasks and courses when the component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Update filtered tasks when tasks change or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchQuery, currentFilter, currentSort, currentGroup]);

  // Load data from storage
  const loadData = async () => {
    setRefreshing(true);
    const loadedTasks = await loadTasksFromStorage();
    const loadedCourses = await loadCoursesFromStorage();
    
    setTasks(loadedTasks);
    setCourses(loadedCourses);
    setRefreshing(false);
  };

  // Refresh data
  const handleRefresh = useCallback(() => {
    loadData();
  }, []);

  // Apply filters, sorting, and grouping
  const applyFiltersAndSort = () => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task => task.title.toLowerCase().includes(query) || 
               (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    switch (currentFilter) {
      case FILTERS.TODAY:
        filtered = filtered.filter(task => task.isDueToday());
        break;
      case FILTERS.UPCOMING:
        filtered = filtered.filter(task => !task.isCompleted && !task.isOverdue() && !task.isDueToday());
        break;
      case FILTERS.COMPLETED:
        filtered = filtered.filter(task => task.isCompleted);
        break;
      case FILTERS.OVERDUE:
        filtered = filtered.filter(task => task.isOverdue());
        break;
      case FILTERS.ALL:
      default:
        // No additional filtering
        break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (currentSort) {
        case SORT_TYPES.DUE_DATE_ASC:
          // Tasks without due dates at the end
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
          
        case SORT_TYPES.DUE_DATE_DESC:
          // Tasks without due dates at the end
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate) - new Date(a.dueDate);
          
        case SORT_TYPES.PRIORITY_HIGH:
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
          
        case SORT_TYPES.PRIORITY_LOW:
          const priorityOrderReverse = { high: 2, medium: 1, low: 0 };
          return priorityOrderReverse[a.priority] - priorityOrderReverse[b.priority];
          
        case SORT_TYPES.ALPHABETICAL:
          return a.title.localeCompare(b.title);
          
        default:
          return 0;
      }
    });
    
    // Apply grouping
    if (currentGroup === GROUP_TYPES.NONE) {
      setFilteredTasks(filtered);
      setGroupedTasks({});
        } else {
      const groups = {};
      
      filtered.forEach(task => {
        let groupKey;
        let groupTitle;
        
        switch (currentGroup) {
          case GROUP_TYPES.COURSE:
            groupKey = task.courseId || 'uncategorized';
            groupTitle = task.courseName || 'No Course';
            break;
          
          case GROUP_TYPES.PRIORITY:
            groupKey = task.priority;
            groupTitle = task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + ' Priority';
            break;
          
          case GROUP_TYPES.CATEGORY:
            groupKey = task.category;
            groupTitle = task.category.charAt(0).toUpperCase() + task.category.slice(1);
            break;
          
          case GROUP_TYPES.DUE_DATE:
            if (!task.dueDate) {
              groupKey = 'no-date';
              groupTitle = 'No Due Date';
            } else if (task.isDueToday()) {
              groupKey = 'today';
              groupTitle = 'Today';
            } else if (task.isOverdue()) {
              groupKey = 'overdue';
              groupTitle = 'Overdue';
            } else {
              const date = new Date(task.dueDate);
              groupKey = task.dueDate;
              groupTitle = date.toLocaleDateString(undefined, { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              });
            }
            break;
            
          default:
            groupKey = 'other';
            groupTitle = 'Other';
        }
        
        if (!groups[groupKey]) {
          groups[groupKey] = {
            title: groupTitle,
            data: []
          };
        }
        
        groups[groupKey].data.push(task);
      });
      
      // Sort the groups
      const sortedGroups = {};
      
      if (currentGroup === GROUP_TYPES.DUE_DATE) {
        // Special sorting for due dates
        const groupKeys = Object.keys(groups);
        
        // Extract dates and sort them
        const specialKeys = ['overdue', 'today', 'no-date'];
        const dateKeys = groupKeys.filter(key => !specialKeys.includes(key))
          .sort((a, b) => new Date(a) - new Date(b));
        
        // Special keys order
        if (groups['overdue']) {
          sortedGroups['overdue'] = groups['overdue'];
        }
        
        if (groups['today']) {
          sortedGroups['today'] = groups['today'];
        }
        
        // Add sorted date keys
        dateKeys.forEach(key => {
          sortedGroups[key] = groups[key];
        });
        
        // Add "no date" at the end
        if (groups['no-date']) {
          sortedGroups['no-date'] = groups['no-date'];
        }
      } else if (currentGroup === GROUP_TYPES.PRIORITY) {
        // Priority order: High, Medium, Low
        const priorityOrder = ['high', 'medium', 'low'];
        
        priorityOrder.forEach(priority => {
          if (groups[priority]) {
            sortedGroups[priority] = groups[priority];
          }
        });
      } else {
        // Alphabetical sorting for other groups
        Object.keys(groups).sort((a, b) => {
          if (a === 'uncategorized') return 1;
          if (b === 'uncategorized') return -1;
          return groups[a].title.localeCompare(groups[b].title);
        }).forEach(key => {
          sortedGroups[key] = groups[key];
        });
      }
      
      setFilteredTasks([]);
      setGroupedTasks(sortedGroups);
      
      // Initialize expanded state for all groups
      const initialExpandedState = {};
      Object.keys(sortedGroups).forEach(key => {
        initialExpandedState[key] = true; // All groups expanded by default
      });
      
      // Keep existing expanded states when reapplying filters
      setExpandedGroups(prev => {
        const newState = { ...initialExpandedState };
        
        // Preserve expanded states for groups that still exist
        Object.keys(prev).forEach(key => {
          if (newState[key] !== undefined) {
            newState[key] = prev[key];
          }
        });
        
        return newState;
      });
    }
  };

  // Toggle group expansion
  const toggleGroupExpanded = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Handle adding a new task
  const handleAddTask = async (taskData) => {
    const newTask = await addTask(taskData);
    
    if (newTask) {
      setTasks(prevTasks => [...prevTasks, newTask]);
      setModalVisible(false);
      setEditingTask(null);
    }
  };

  // Handle updating a task
  const handleUpdateTask = async (taskData) => {
    const updatedTask = await updateTask(taskData.id, taskData);
    
    if (updatedTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      setModalVisible(false);
      setEditingTask(null);
    }
  };

  // Handle toggling task completion
  const handleToggleTaskCompletion = async (taskId) => {
    const updatedTask = await toggleTaskCompletion(taskId);
    
    if (updatedTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
    }
  };

  // Handle toggling subtask completion
  const handleToggleSubtaskCompletion = async (taskId, subtaskId) => {
    const updatedTask = await toggleSubTaskCompletion(taskId, subtaskId);
    
    if (updatedTask) {
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    const success = await deleteTask(taskId);
    
    if (success) {
      setTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      );
    }
  };

  // Handle editing a task
  const handleEditTask = (task) => {
    setEditingTask(task);
          setModalVisible(true);
  };

  // Render a filter button
  const renderFilterButton = (filter, label, icon) => (
      <TouchableOpacity
        style={[
        styles.filterButton,
        currentFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setCurrentFilter(filter)}
    >
      <Ionicons 
        name={icon} 
        size={18} 
        color={currentFilter === filter ? COLORS.white : COLORS.gray} 
      />
      <Text 
          style={[
          styles.filterButtonText,
          currentFilter === filter && styles.filterButtonTextActive
        ]}
      >
        {label}
      </Text>
        </TouchableOpacity>
  );

  // Render filter controls
  const renderFilterControls = () => (
    <View style={styles.filterControls}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContent}
      >
        {renderFilterButton(FILTERS.ALL, 'All', 'list')}
        {renderFilterButton(FILTERS.TODAY, 'Today', 'today')}
        {renderFilterButton(FILTERS.UPCOMING, 'Upcoming', 'calendar')}
        {renderFilterButton(FILTERS.OVERDUE, 'Overdue', 'alert-circle')}
        {renderFilterButton(FILTERS.COMPLETED, 'Completed', 'checkmark-circle')}
      </ScrollView>
      
      <View style={styles.sortGroupContainer}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render advanced filter panel
  const renderAdvancedFilters = () => (
    <View style={styles.advancedFiltersContainer}>
      {/* Sort options */}
      <View style={styles.advancedSection}>
        <Text style={styles.advancedSectionTitle}>Sort by</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentSort === SORT_TYPES.DUE_DATE_ASC && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentSort(SORT_TYPES.DUE_DATE_ASC)}
          >
            <Text style={currentSort === SORT_TYPES.DUE_DATE_ASC ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Due Date (↑)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentSort === SORT_TYPES.DUE_DATE_DESC && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentSort(SORT_TYPES.DUE_DATE_DESC)}
          >
            <Text style={currentSort === SORT_TYPES.DUE_DATE_DESC ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Due Date (↓)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentSort === SORT_TYPES.PRIORITY_HIGH && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentSort(SORT_TYPES.PRIORITY_HIGH)}
          >
            <Text style={currentSort === SORT_TYPES.PRIORITY_HIGH ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Priority (High→Low)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentSort === SORT_TYPES.PRIORITY_LOW && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentSort(SORT_TYPES.PRIORITY_LOW)}
          >
            <Text style={currentSort === SORT_TYPES.PRIORITY_LOW ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Priority (Low→High)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentSort === SORT_TYPES.ALPHABETICAL && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentSort(SORT_TYPES.ALPHABETICAL)}
          >
            <Text style={currentSort === SORT_TYPES.ALPHABETICAL ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Alphabetical
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Group options */}
      <View style={styles.advancedSection}>
        <Text style={styles.advancedSectionTitle}>Group by</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentGroup === GROUP_TYPES.NONE && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentGroup(GROUP_TYPES.NONE)}
          >
            <Text style={currentGroup === GROUP_TYPES.NONE ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              None
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentGroup === GROUP_TYPES.COURSE && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentGroup(GROUP_TYPES.COURSE)}
          >
            <Text style={currentGroup === GROUP_TYPES.COURSE ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Course
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentGroup === GROUP_TYPES.CATEGORY && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentGroup(GROUP_TYPES.CATEGORY)}
          >
            <Text style={currentGroup === GROUP_TYPES.CATEGORY ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Category
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
              style={[
              styles.advancedButton,
              currentGroup === GROUP_TYPES.PRIORITY && styles.advancedButtonActive
              ]}
            onPress={() => setCurrentGroup(GROUP_TYPES.PRIORITY)}
            >
            <Text style={currentGroup === GROUP_TYPES.PRIORITY ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Priority
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.advancedButton,
              currentGroup === GROUP_TYPES.DUE_DATE && styles.advancedButtonActive
            ]}
            onPress={() => setCurrentGroup(GROUP_TYPES.DUE_DATE)}
          >
            <Text style={currentGroup === GROUP_TYPES.DUE_DATE ? styles.advancedButtonTextActive : styles.advancedButtonText}>
              Due Date
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  // Render a task item
  const renderTaskItem = ({ item }) => (
    <TaskItem
      task={item}
      onPress={() => handleEditTask(item)}
      onToggleComplete={handleToggleTaskCompletion}
      onToggleSubtask={handleToggleSubtaskCompletion}
      onDelete={handleDeleteTask}
      style={styles.taskItem}
    />
  );

  // Render a group header
  const renderGroupHeader = (title, groupId, count) => (
    <TouchableOpacity 
      style={styles.groupHeader} 
      onPress={() => toggleGroupExpanded(groupId)}
    >
      <View style={styles.groupTitleContainer}>
        <Text style={styles.groupTitle}>{title}</Text>
        <Text style={styles.groupCount}>{count}</Text>
      </View>
      
      <Ionicons 
        name={expandedGroups[groupId] ? 'chevron-up' : 'chevron-down'} 
        size={20} 
        color={COLORS.gray} 
      />
    </TouchableOpacity>
  );

  // Render the task list content
  const renderContent = () => {
    // If no tasks exist
    if (tasks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={72} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>No Tasks Yet</Text>
          <Text style={styles.emptySubtitle}>
            Add tasks to stay organized and track your assignments
            </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => {
              setEditingTask(null);
              setModalVisible(true);
            }}
          >
            <Text style={styles.emptyButtonText}>Create First Task</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // If filtered tasks list is empty after applying filters
    if (filteredTasks.length === 0 && Object.keys(groupedTasks).length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color={COLORS.lightGray} />
          <Text style={styles.noResultsTitle}>No Tasks Found</Text>
          <Text style={styles.noResultsSubtitle}>
            Try changing your filters or search query
          </Text>
      </View>
      );
    }
    
    // Render grouped tasks
    if (Object.keys(groupedTasks).length > 0) {
      return (
        <View style={styles.groupedList}>
          {Object.entries(groupedTasks).map(([groupId, group]) => (
            <View key={groupId} style={styles.groupContainer}>
              {renderGroupHeader(group.title, groupId, group.data.length)}
              
              {expandedGroups[groupId] && (
                <View style={styles.groupContent}>
                  {group.data.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onPress={() => handleEditTask(task)}
                      onToggleComplete={handleToggleTaskCompletion}
                      onToggleSubtask={handleToggleSubtaskCompletion}
                      onDelete={handleDeleteTask}
                      style={styles.taskItem}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      );
    }
    
    // Render flat list of tasks
    return (
        <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/App Logo - Transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim() !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Filters */}
      {renderFilterControls()}
      
      {/* Advanced filters */}
      {showFilters && renderAdvancedFilters()}
      
      {/* Task list */}
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {/* Add task button */}
      <GradientButton
        title="Add Task"
        onPress={() => {
          setEditingTask(null);
          setModalVisible(true);
        }}
        style={styles.addButton}
        icon={<Ionicons name="add" size={24} color={COLORS.white} />}
        size="large"
      />
      
      {/* Task form modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TaskForm
            initialTask={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleAddTask}
              onCancel={() => {
                setModalVisible(false);
                setEditingTask(null);
              }}
            />
        </SafeAreaView>
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
    backgroundColor: COLORS.white,
    padding: 20,
    ...SHADOWS.light,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 15,
    height: 48,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  filterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filtersScrollContent: {
    paddingRight: 16,
    flexGrow: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: COLORS.lightGray,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  sortGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  taskItem: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  advancedFiltersContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  advancedSection: {
    marginBottom: 8,
  },
  advancedSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  advancedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: COLORS.lightGray,
    marginBottom: 4,
  },
  advancedButtonActive: {
    backgroundColor: COLORS.primary,
  },
  advancedButtonText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  advancedButtonTextActive: {
    color: COLORS.white,
  },
  groupedList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.buttonRadius,
    ...SHADOWS.light,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  groupCount: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 8,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  groupContent: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    maxWidth: 300,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: SIZES.buttonRadius,
    ...SHADOWS.medium,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default TasksScreen; 