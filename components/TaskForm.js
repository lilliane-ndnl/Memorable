import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { loadCoursesFromStorage } from '../utils/courseHelpers';
import { generateTaskId } from '../utils/taskHelpers';

const CATEGORIES = [
  { id: 'homework', label: 'Homework', icon: 'document-text' },
  { id: 'exam', label: 'Exam', icon: 'school' },
  { id: 'project', label: 'Project', icon: 'construct' },
  { id: 'reading', label: 'Reading', icon: 'book' },
  { id: 'meeting', label: 'Meeting', icon: 'people' },
  { id: 'presentation', label: 'Presentation', icon: 'easel' },
  { id: 'assignment', label: 'Assignment', icon: 'clipboard' },
  { id: 'quiz', label: 'Quiz', icon: 'help-circle' },
  { id: 'general', label: 'General', icon: 'checkbox' }
];

const PRIORITIES = [
  { id: 'high', label: 'High', color: '#FF6B6B' },
  { id: 'medium', label: 'Medium', color: '#FFCC4D' },
  { id: 'low', label: 'Low', color: '#63D471' }
];

const TaskForm = ({ initialTask = null, onSubmit, onCancel }) => {
  // Task state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [dueTime, setDueTime] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('general');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [newSubTask, setNewSubTask] = useState('');
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showDueTimePicker, setShowDueTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  
  // Load courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      const loadedCourses = await loadCoursesFromStorage();
      setCourses(loadedCourses);
    };
    
    loadCourses();
  }, []);
  
  // Initialize form with initial task data if provided
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCourseId(initialTask.courseId || null);
      setCourseName(initialTask.courseName || null);
      setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate) : null);
      setDueTime(initialTask.dueTime ? convertTimeStringToDate(initialTask.dueTime) : null);
      setPriority(initialTask.priority || 'medium');
      setCategory(initialTask.category || 'general');
      setReminderEnabled(initialTask.reminderTime !== null);
      setReminderTime(initialTask.reminderTime ? new Date(initialTask.reminderTime) : null);
      setSubTasks(initialTask.subTasks ? [...initialTask.subTasks] : []);
      setTags(initialTask.tags ? [...initialTask.tags] : []);
    }
  }, [initialTask]);
  
  // Helper to convert time string to Date object
  const convertTimeStringToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  // Helper to convert Date to time string
  const formatTimeString = (date) => {
    if (!date) return null;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Helper to format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return 'No date selected';
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Helper to format time for display
  const formatTimeForDisplay = (date) => {
    if (!date) return 'No time selected';
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Handle adding sub-task
  const handleAddSubTask = () => {
    if (newSubTask.trim() === '') return;
    
    const newSubTaskObj = {
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newSubTask,
      completed: false
    };
    
    setSubTasks([...subTasks, newSubTaskObj]);
    setNewSubTask('');
  };
  
  // Handle removing sub-task
  const handleRemoveSubTask = (id) => {
    setSubTasks(subTasks.filter(subTask => subTask.id !== id));
  };
  
  // Handle adding tag
  const handleAddTag = () => {
    if (newTag.trim() === '') return;
    if (tags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }
    
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };
  
  // Handle removing tag
  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Handle course selection
  const handleCourseSelect = (course) => {
    setCourseId(course.id);
    setCourseName(course.name);
    setShowCourseDropdown(false);
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  // Handle time change
  const handleTimeChange = (event, selectedTime) => {
    setShowDueTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setDueTime(selectedTime);
    }
  };
  
  // Handle reminder time change
  const handleReminderTimeChange = (event, selectedTime) => {
    setShowReminderPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };
  
  // Submit the form
  const handleSubmit = () => {
    if (title.trim() === '') {
      Alert.alert('Error', 'Task title is required');
      return;
    }
    
    // Prepare task data
    const taskData = {
      id: initialTask?.id || generateTaskId(),
      title: title.trim(),
      description: description.trim(),
      courseId,
      courseName,
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
      dueTime: dueTime ? formatTimeString(dueTime) : null,
      priority,
      category,
      reminderTime: reminderEnabled && reminderTime ? reminderTime.toISOString() : null,
      subTasks,
      tags
    };
    
    onSubmit(taskData);
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          {/* Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={COLORS.gray}
            />
          </View>
          
          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          {/* Course Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Course</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCourseDropdown(!showCourseDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {courseName || 'Select Course (Optional)'}
              </Text>
              <Ionicons
                name={showCourseDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.gray}
              />
            </TouchableOpacity>
            
            {showCourseDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCourseId(null);
                    setCourseName(null);
                    setShowCourseDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>None</Text>
                </TouchableOpacity>
                
                {courses.map(course => (
                  <TouchableOpacity
                    key={course.id}
                    style={styles.dropdownItem}
                    onPress={() => handleCourseSelect(course)}
                  >
                    <View style={[styles.courseDot, { backgroundColor: course.color }]} />
                    <Text style={styles.dropdownItemText}>{course.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Due Date & Priority</Text>
          
          {/* Due Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDueDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={COLORS.primary} style={styles.dateIcon} />
              <Text style={styles.dateButtonText}>
                {dueDate ? formatDateForDisplay(dueDate) : 'Select Due Date (Optional)'}
              </Text>
            </TouchableOpacity>
            
            {showDueDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          {/* Due Time */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Due Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDueTimePicker(true)}
              disabled={!dueDate}
            >
              <Ionicons name="time" size={20} color={dueDate ? COLORS.primary : COLORS.gray} style={styles.dateIcon} />
              <Text style={[styles.dateButtonText, !dueDate && styles.disabledText]}>
                {dueTime ? formatTimeForDisplay(dueTime) : 'Select Due Time (Optional)'}
              </Text>
            </TouchableOpacity>
            
            {showDueTimePicker && (
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>
          
          {/* Priority */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={styles.priorityContainer}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityButton,
                    priority === p.id && [styles.priorityButtonSelected, { backgroundColor: p.color + '33' }]
                  ]}
                  onPress={() => setPriority(p.id)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <Text style={[
                    styles.priorityButtonText,
                    priority === p.id && styles.priorityButtonTextSelected
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && styles.categoryButtonSelected
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={18}
                      color={category === cat.id ? COLORS.primary : COLORS.gray}
                      style={styles.categoryIcon}
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      category === cat.id && styles.categoryButtonTextSelected
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Sub-Tasks</Text>
          
          {/* Add Sub-Task */}
          <View style={styles.inputContainer}>
            <View style={styles.subTaskInputRow}>
              <TextInput
                style={styles.subTaskInput}
                value={newSubTask}
                onChangeText={setNewSubTask}
                placeholder="Add a sub-task"
                placeholderTextColor={COLORS.gray}
                onSubmitEditing={handleAddSubTask}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addSubTaskButton}
                onPress={handleAddSubTask}
                disabled={newSubTask.trim() === ''}
              >
                <Ionicons name="add-circle" size={24} color={newSubTask.trim() !== '' ? COLORS.primary : COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Sub-Tasks List */}
          {subTasks.length > 0 && (
            <View style={styles.subTasksList}>
              {subTasks.map((subTask, index) => (
                <View key={subTask.id} style={styles.subTaskItem}>
                  <View style={styles.subTaskDetails}>
                    <Text style={styles.subTaskTitle}>{`${index + 1}. ${subTask.title}`}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeSubTaskButton}
                    onPress={() => handleRemoveSubTask(subTask.id)}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Tags & Reminder</Text>
          
          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tags</Text>
            <View style={styles.subTaskInputRow}>
              <TextInput
                style={styles.subTaskInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add a tag"
                placeholderTextColor={COLORS.gray}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addSubTaskButton}
                onPress={handleAddTag}
                disabled={newTag.trim() === ''}
              >
                <Ionicons name="pricetag" size={24} color={newTag.trim() !== '' ? COLORS.primary : COLORS.gray} />
              </TouchableOpacity>
            </View>
            
            {/* Tags List */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map(tag => (
                  <View key={tag} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() => handleRemoveTag(tag)}
                    >
                      <Ionicons name="close" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          {/* Reminder */}
          <View style={styles.inputContainer}>
            <View style={styles.reminderRow}>
              <Text style={styles.inputLabel}>Set Reminder</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '70' }}
                thumbColor={reminderEnabled ? COLORS.primary : COLORS.white}
              />
            </View>
            
            {reminderEnabled && (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowReminderPicker(true)}
              >
                <Ionicons name="notifications" size={20} color={COLORS.primary} style={styles.dateIcon} />
                <Text style={styles.dateButtonText}>
                  {reminderTime ? reminderTime.toLocaleString() : 'Select Reminder Time'}
                </Text>
              </TouchableOpacity>
            )}
            
            {showReminderPicker && (
              <DateTimePicker
                value={reminderTime || new Date()}
                mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleReminderTimeChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        </View>
        
        {/* Form Actions */}
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{initialTask ? 'Update Task' : 'Add Task'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius,
    padding: 16,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  titleInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  descriptionInput: {
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  dropdownButton: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  courseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dateButton: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  disabledText: {
    color: COLORS.gray,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    height: 45,
    marginHorizontal: 4,
    borderRadius: SIZES.buttonRadius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  priorityButtonSelected: {
    borderColor: COLORS.primary,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  priorityButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  priorityButtonTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryScrollView: {
    flex: 1,
    flexGrow: 0,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  categoryButton: {
    height: 36,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  categoryButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  categoryButtonTextSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  subTaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTaskInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  addSubTaskButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTasksList: {
    marginTop: 8,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.buttonRadius,
    marginBottom: 8,
    backgroundColor: COLORS.lightGray + '50',
  },
  subTaskDetails: {
    flex: 1,
  },
  subTaskTitle: {
    fontSize: 16,
    color: COLORS.text,
  },
  removeSubTaskButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 14,
    marginRight: 6,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    height: 50,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  submitButton: {
    height: 50,
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default TaskForm; 