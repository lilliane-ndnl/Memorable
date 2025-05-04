import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { COURSE_COLORS } from '../constants/theme';
import { formatDate, formatTime } from '../utils/helpers';
import { loadCoursesFromStorage } from '../utils/courseHelpers';

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
  
  // Date & Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Course options from stored courses
  const [courseOptions, setCourseOptions] = useState(Object.entries(COURSE_COLORS).map(([value, color]) => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    value,
    color
  })));
  
  // Load courses from storage
  useEffect(() => {
    const loadCourses = async () => {
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
    };
    
    loadCourses();
  }, []);

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
    };

    onSubmit(taskData);
  };

  // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // Time picker handlers
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setDueTime(selectedTime);
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
                  assignmentType === type.value && styles.activeTypeButton
                ]}
                onPress={() => setAssignmentType(type.value)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={20} 
                  color={assignmentType === type.value ? COLORS.white : COLORS.primary} 
                />
                <Text 
                  style={[
                    styles.typeText,
                    assignmentType === type.value && styles.activeTypeText
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
                value={dueDate}
                mode="date"
                display="default"
                onChange={onDateChange}
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
                value={dueTime}
                mode="time"
                is24Hour={false}
                display="default"
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
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeTypeButton: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 6,
  },
  activeTypeText: {
    color: COLORS.white,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
});

export default AddTaskForm; 