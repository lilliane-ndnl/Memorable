import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { COURSE_COLORS } from '../constants/theme';
import { formatDate, formatTime } from '../utils/helpers';
import { loadCoursesFromStorage } from '../utils/courseHelpers';
import { loadTaskGroupsFromStorage, createTaskGroup } from '../utils/groupHelpers';
import SubTaskList from './SubTaskList';

const PRIORITY_OPTIONS = [
  { label: 'High', value: 'high', color: COLORS.danger },
  { label: 'Medium', value: 'medium', color: COLORS.warning },
  { label: 'Low', value: 'low', color: COLORS.success },
];

const ASSIGNMENT_TYPES = [
  { label: 'Homework', value: 'homework', icon: 'create-outline' },
  { label: 'Quiz', value: 'quiz', icon: 'help-circle-outline' },
  { label: 'Exam', value: 'exam', icon: 'school-outline' },
  { label: 'Essay', value: 'essay', icon: 'document-text-outline' },
  { label: 'Project', value: 'project', icon: 'construct-outline' },
  { label: 'Reading', value: 'reading', icon: 'book-outline' },
  { label: 'Presentation', value: 'presentation', icon: 'easel-outline' },
  { label: 'Lab', value: 'lab', icon: 'flask-outline' },
];

// Assignment types that typically benefit from subtasks
const SUBTASK_ENABLED_TYPES = ['essay', 'project', 'presentation', 'homework'];

const AddTaskForm = ({ onSubmit, onCancel, initialTask = null }) => {
  // State for form fields
  const [title, setTitle] = useState(initialTask?.title || '');
  const [course, setCourse] = useState(initialTask?.courseName || '');
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate 
      ? new Date(initialTask.dueDate)
      : new Date()
  );
  const [dueTime, setDueTime] = useState(() => {
    if (initialTask?.dueTime) {
      // Parse time string like "10:30 AM" into a Date object
      const [timePart, ampm] = initialTask.dueTime.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      
      const date = new Date();
      let hour = hours;
      
      // Convert to 24 hour format
      if (ampm === 'PM' && hours < 12) hour += 12;
      if (ampm === 'AM' && hours === 12) hour = 0;
      
      date.setHours(hour, minutes, 0);
      return date;
    }
    return new Date();
  });
  
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  const [assignmentType, setAssignmentType] = useState(initialTask?.type || 'homework');
  const [taskGroup, setTaskGroup] = useState(initialTask?.groupId || null);
  const [subTasks, setSubTasks] = useState(initialTask?.subTasks || []);
  const [showSubTasks, setShowSubTasks] = useState(false);
  
  // Date & Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Course options from stored courses
  const [courseOptions, setCourseOptions] = useState(Object.entries(COURSE_COLORS).map(([value, color]) => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value,
    color
  })));
  
  // Group state
  const [groups, setGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(COLORS.primary);
  
  // Group color options
  const groupColorOptions = [
    '#9C27B0', // Purple
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FFC107', // Amber
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#FF5722', // Deep Orange
    '#FF9800', // Orange
    '#009688', // Teal
    '#F44336', // Red
  ];
  
  // Load courses and groups from storage
  useEffect(() => {
    const loadData = async () => {
      // Load courses
      const courses = await loadCoursesFromStorage();
      if (courses && courses.length > 0) {
        // Create course options from saved courses
        const options = courses.map(course => ({
          label: course.name,
          value: course.name,
          color: course.color
        }));
        
        setCourseOptions(options);
      }
      
      // Load groups
      const taskGroups = await loadTaskGroupsFromStorage();
      setGroups(taskGroups);
    };
    
    loadData();
  }, []);
  
  // Show/hide subtasks based on the assignment type
  useEffect(() => {
    setShowSubTasks(SUBTASK_ENABLED_TYPES.includes(assignmentType));
  }, [assignmentType]);

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    if (!course) {
      alert('Please select a course');
      return;
    }

    const taskData = {
      title: title.trim(),
      courseName: course,
      dueDate: formatDate(dueDate),
      dueTime: formatTime(dueTime),
      priority,
      notes: notes.trim(),
      type: assignmentType,
      groupId: taskGroup,
      subTasks: subTasks,
    };

    onSubmit(taskData);
  };

  // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  // Time picker handlers
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || dueTime;
    setShowTimePicker(Platform.OS === 'ios');
    setDueTime(currentTime);
  };
  
  // Add new group
  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    const newGroup = createTaskGroup(newGroupName.trim(), newGroupColor);
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    setTaskGroup(newGroup.id);
    setShowGroupModal(false);
    setNewGroupName('');
  };
  
  // Handle sub-tasks change
  const handleSubTasksChange = (updatedSubTasks) => {
    setSubTasks(updatedSubTasks);
  };
  
  // Generate default subtasks for certain assignment types
  const generateDefaultSubTasks = (type) => {
    const formattedDate = formatDate(dueDate);
    let defaultTasks = [];
    
    switch (type) {
      case 'essay':
        defaultTasks = [
          { id: Date.now() + '-1', title: 'Research', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-2', title: 'Outline', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-3', title: 'Draft', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-4', title: 'Citations', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-5', title: 'Final Edit', completed: false, dueDate: formattedDate },
        ];
        break;
      case 'project':
        defaultTasks = [
          { id: Date.now() + '-1', title: 'Plan', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-2', title: 'Research', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-3', title: 'Implement', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-4', title: 'Test', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-5', title: 'Finalize', completed: false, dueDate: formattedDate },
        ];
        break;
      case 'presentation':
        defaultTasks = [
          { id: Date.now() + '-1', title: 'Research', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-2', title: 'Create Slides', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-3', title: 'Prepare Notes', completed: false, dueDate: formattedDate },
          { id: Date.now() + '-4', title: 'Practice', completed: false, dueDate: formattedDate },
        ];
        break;
      default:
        break;
    }
    
    setSubTasks(defaultTasks);
  };
  
  // Handle assignment type change
  const handleTypeChange = (type) => {
    setAssignmentType(type);
    
    // Only generate default subtasks if this is a new task and there are no existing subtasks
    if (!initialTask && subTasks.length === 0) {
      generateDefaultSubTasks(type);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {initialTask ? 'Edit Assignment' : 'Add New Assignment'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Assignment Title</Text>
          <TextInput 
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter assignment title"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Assignment Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.typeScrollView}
          >
            {ASSIGNMENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  assignmentType === type.value && styles.activeTypeButton,
                  SUBTASK_ENABLED_TYPES.includes(type.value) && styles.subtaskEnabledButton
                ]}
                onPress={() => handleTypeChange(type.value)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={20} 
                  color={assignmentType === type.value ? COLORS.white : (SUBTASK_ENABLED_TYPES.includes(type.value) ? COLORS.primary : COLORS.gray)} 
                />
                <Text 
                  style={[
                    styles.typeText,
                    assignmentType === type.value && styles.activeTypeText,
                    SUBTASK_ENABLED_TYPES.includes(type.value) && styles.subtaskEnabledText
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Course</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.courseScrollView}
          >
            {courseOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.color + '20' }, // 20% opacity
                  course === option.value && {
                    backgroundColor: option.color + '40', // 40% opacity
                    borderColor: option.color,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => setCourse(option.value)}
              >
                <View style={[styles.colorDot, { backgroundColor: option.color }]} />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.groupHeader}>
            <Text style={styles.label}>Group (Optional)</Text>
            <TouchableOpacity
              style={styles.addGroupButton}
              onPress={() => setShowGroupModal(true)}
            >
              <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
              <Text style={styles.addGroupText}>New Group</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.groupScrollView}
          >
            <TouchableOpacity
              style={[
                styles.groupButton,
                !taskGroup && styles.activeGroupButton
              ]}
              onPress={() => setTaskGroup(null)}
            >
              <Text style={[
                styles.groupText,
                !taskGroup && styles.activeGroupText
              ]}>None</Text>
            </TouchableOpacity>
            
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupButton,
                  { borderColor: group.color },
                  taskGroup === group.id && {
                    backgroundColor: group.color + '40', // 40% opacity
                  }
                ]}
                onPress={() => setTaskGroup(group.id)}
              >
                <View style={[styles.colorDot, { backgroundColor: group.color }]} />
                <Text style={styles.groupText}>{group.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>
                {formatDate(dueDate)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Due Time</Text>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>
                {formatTime(dueTime)}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                testID="timeTimePicker"
                value={dueTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityOptions}>
            {PRIORITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityButton,
                  priority === option.value && {
                    backgroundColor: option.color + '20', // 20% opacity
                    borderColor: option.color,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => setPriority(option.value)}
              >
                <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Sub-tasks section - only shown for certain assignment types */}
        {showSubTasks && (
          <View style={styles.subTasksContainer}>
            <SubTaskList 
              subTasks={subTasks} 
              onChange={handleSubTasksChange}
              parentDueDate={formatDate(dueDate)}
            />
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add assignment details, instructions, or page numbers..."
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {initialTask ? 'Update' : 'Add'} Assignment
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Add New Group Modal */}
      <Modal
        visible={showGroupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.groupModalContent}>
            <Text style={styles.groupModalTitle}>Create New Group</Text>
            
            <View style={styles.groupFormItem}>
              <Text style={styles.groupModalLabel}>Group Name</Text>
              <TextInput 
                style={styles.groupInput}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Enter group name"
                placeholderTextColor={COLORS.gray}
              />
            </View>
            
            <View style={styles.groupFormItem}>
              <Text style={styles.groupModalLabel}>Group Color</Text>
              <View style={styles.colorOptions}>
                {groupColorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newGroupColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setNewGroupColor(color)}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.groupModalButtons}>
              <TouchableOpacity 
                style={[styles.groupModalButton, styles.cancelGroupButton]}
                onPress={() => setShowGroupModal(false)}
              >
                <Text style={styles.cancelGroupText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.groupModalButton, styles.addGroupModalButton]}
                onPress={handleAddGroup}
              >
                <Text style={styles.addGroupModalText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  courseScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.buttonRadius - 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  activeTypeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subtaskEnabledButton: {
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 6,
  },
  activeTypeText: {
    color: COLORS.white,
  },
  subtaskEnabledText: {
    color: COLORS.primary,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.buttonRadius - 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius - 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: SIZES.buttonRadius,
    ...SHADOWS.light,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
  },
  // Group selection styles
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  addGroupText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  groupScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  activeGroupButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  groupText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeGroupText: {
    color: COLORS.white,
  },
  // Group modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  groupModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.medium,
  },
  groupModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  groupFormItem: {
    marginBottom: 16,
  },
  groupModalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  groupInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    margin: 4,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: COLORS.black,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  groupModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  groupModalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelGroupButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  addGroupModalButton: {
    backgroundColor: COLORS.primary,
  },
  cancelGroupText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  addGroupModalText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
  },
  // Sub-tasks styles
  subTasksContainer: {
    backgroundColor: COLORS.lightGray + '30',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
});

export default AddTaskForm; 