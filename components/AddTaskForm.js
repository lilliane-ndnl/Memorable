import React, { useState } from 'react';
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
import { COLORS, SIZES } from '../constants/theme';
import { COURSE_COLORS } from '../constants/theme';
import { formatDate, formatTime } from '../utils/helpers';

const PRIORITY_OPTIONS = [
  { label: 'High', value: 'high', color: COLORS.danger },
  { label: 'Medium', value: 'medium', color: COLORS.warning },
  { label: 'Low', value: 'low', color: COLORS.success },
];

const COURSE_OPTIONS = [
  { label: 'Math', value: 'math', color: COURSE_COLORS.math },
  { label: 'Science', value: 'science', color: COURSE_COLORS.science },
  { label: 'History', value: 'history', color: COURSE_COLORS.history },
  { label: 'English', value: 'english', color: COURSE_COLORS.english },
  { label: 'Art', value: 'art', color: COURSE_COLORS.art },
  { label: 'Computer Science', value: 'cs', color: COURSE_COLORS.cs },
  { label: 'Business', value: 'business', color: COURSE_COLORS.business },
];

const AddTaskForm = ({ onSubmit, onCancel, initialTask = null }) => {
  // Initialize state with initial task values or defaults
  const [title, setTitle] = useState(initialTask?.title || '');
  const [course, setCourse] = useState(initialTask?.courseName || '');
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate 
      ? new Date(initialTask.dueDate)
      : new Date()
  );
  const [dueTime, setDueTime] = useState(
    initialTask?.dueTime
      ? new Date(`2000-01-01T${initialTask.dueTime}:00`)
      : new Date()
  );
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  
  // Date & Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
    };

    onSubmit(taskData);
  };

  // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // Time picker handlers
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
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
          {initialTask ? 'Edit Task' : 'Add New Task'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput 
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Course</Text>
          <View style={styles.optionsContainer}>
            {COURSE_OPTIONS.map((option) => (
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
          </View>
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
                <Text 
                  style={[
                    styles.priorityText,
                    priority === option.value && { color: option.color }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput 
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional details..."
            placeholderTextColor={COLORS.gray}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
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
              {initialTask ? 'Update' : 'Add Task'}
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
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: SIZES.medium,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  input: {
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  dateTimeText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginLeft: SIZES.base,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.small,
    marginHorizontal: 4,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.lightGray + '40',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  priorityText: {
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    margin: 4,
    borderRadius: SIZES.base,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  optionText: {
    fontSize: SIZES.small,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.large,
  },
  button: {
    flex: 1,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: 10,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
});

export default AddTaskForm; 