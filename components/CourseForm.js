import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import {
  getDaysOfWeek,
  getDefaultCourseColors,
} from '../utils/courseHelpers';

const CourseForm = ({ onSubmit, onCancel, initialCourse = null }) => {
  const [courseName, setCourseName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [currentScheduleItem, setCurrentScheduleItem] = useState(null);
  
  // For schedule modal
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Add course start/end dates
  const [courseStartDate, setCourseStartDate] = useState(new Date());
  const [courseEndDate, setCourseEndDate] = useState(() => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 4); // Default to roughly a semester
    return endDate;
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const colorOptions = getDefaultCourseColors();
  const daysOfWeek = getDaysOfWeek();

  useEffect(() => {
    if (initialCourse) {
      setCourseName(initialCourse.name);
      setSelectedColor(initialCourse.color);
      setSchedule(initialCourse.schedule || []);
      
      // Set start/end dates if they exist
      if (initialCourse.startDate) {
        setCourseStartDate(new Date(initialCourse.startDate));
      }
      if (initialCourse.endDate) {
        setCourseEndDate(new Date(initialCourse.endDate));
      }
    } else {
      setSelectedColor(colorOptions[0]);
    }
  }, [initialCourse]);

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutes} ${ampm}`;
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle date pickers
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || courseStartDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setCourseStartDate(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || courseEndDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setCourseEndDate(currentDate);
  };
  
  // Handle time pickers
  const onStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
  };

  const onEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
  };

  const handleAddScheduleItem = () => {
    setCurrentScheduleItem(null);
    setSelectedDay(daysOfWeek[0]);
    
    const defaultStart = new Date();
    defaultStart.setHours(9, 0, 0);
    setStartTime(defaultStart);
    
    const defaultEnd = new Date();
    defaultEnd.setHours(10, 30, 0);
    setEndTime(defaultEnd);
    
    setLocation('');
    setShowScheduleModal(true);
  };

  const handleEditScheduleItem = (item) => {
    setCurrentScheduleItem(item);
    setSelectedDay(item.day);
    
    // Parse time strings to Date objects
    const parseTime = (timeStr) => {
      const [time, ampm] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      const date = new Date();
      let hour = hours;
      
      if (ampm === 'PM' && hours < 12) hour += 12;
      if (ampm === 'AM' && hours === 12) hour = 0;
      
      date.setHours(hour, minutes, 0);
      return date;
    };
    
    setStartTime(parseTime(item.startTime));
    setEndTime(parseTime(item.endTime));
    setLocation(item.location || '');
    setShowScheduleModal(true);
  };

  const handleSaveScheduleItem = () => {
    const scheduleItem = {
      id: currentScheduleItem?.id || Date.now().toString(),
      day: selectedDay,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      location,
    };
    
    if (currentScheduleItem) {
      // Edit existing
      setSchedule(schedule.map(item => 
        item.id === currentScheduleItem.id ? scheduleItem : item
      ));
    } else {
      // Add new
      setSchedule([...schedule, scheduleItem]);
    }
    
    setShowScheduleModal(false);
  };

  const handleDeleteScheduleItem = (id) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (courseName.trim() === '') {
      alert('Please enter a course name');
      return;
    }
    
    onSubmit({
      name: courseName,
      color: selectedColor,
      schedule,
      startDate: courseStartDate.toISOString(),
      endDate: courseEndDate.toISOString()
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {initialCourse ? 'Edit Course' : 'Add New Course'}
      </Text>
      
      <ScrollView style={styles.form}>
        <Text style={styles.label}>Course Name</Text>
        <TextInput
          style={styles.input}
          value={courseName}
          onChangeText={setCourseName}
          placeholder="Enter course name"
          placeholderTextColor={COLORS.gray}
        />
        
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorOption,
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Add course duration section */}
        <Text style={styles.sectionTitle}>Course Duration</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateText}>
                {formatDate(courseStartDate)}
              </Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                testID="startDatePicker"
                value={courseStartDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartDateChange}
              />
            )}
          </View>
          
          <View style={styles.dateField}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateText}>
                {formatDate(courseEndDate)}
              </Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={courseEndDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEndDateChange}
                minimumDate={courseStartDate}
              />
            )}
          </View>
        </View>
        
        <View style={styles.scheduleHeader}>
          <Text style={styles.sectionTitle}>Class Schedule</Text>
          <TouchableOpacity 
            style={styles.addScheduleButton}
            onPress={handleAddScheduleItem}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {schedule.length === 0 ? (
          <Text style={styles.emptyText}>No class sessions added yet</Text>
        ) : (
          <View style={styles.scheduleList}>
            {schedule.map((item) => (
              <View key={item.id} style={styles.scheduleItem}>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleDay}>{item.day}</Text>
                  <Text style={styles.scheduleTime}>
                    {item.startTime} - {item.endTime}
                  </Text>
                  {item.location && (
                    <Text style={styles.scheduleLocation}>{item.location}</Text>
                  )}
                </View>
                <View style={styles.scheduleActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditScheduleItem(item)}
                  >
                    <Ionicons name="pencil" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteScheduleItem(item.id)}
                  >
                    <Ionicons name="trash" size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
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
            {initialCourse ? 'Update' : 'Add'} Course
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Schedule Item Modal */}
      <Modal
        visible={showScheduleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentScheduleItem ? 'Edit Class Session' : 'Add Class Session'}
            </Text>
            
            <Text style={styles.label}>Day of Week</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.dayScrollView}
            >
              {daysOfWeek.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDay === day && styles.selectedDayButton
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDay === day && styles.selectedDayText
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.timeContainer}>
              <View style={styles.timeField}>
                <Text style={styles.label}>Start Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker 
                    testID="startTimePicker"
                    value={startTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onStartTimeChange}
                  />
                )}
              </View>
              
              <View style={styles.timeField}>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker 
                    testID="endTimePicker"
                    value={endTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onEndTimeChange}
                  />
                )}
              </View>
            </View>
            
            <Text style={styles.label}>Location (Optional)</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Enter classroom or building"
              placeholderTextColor={COLORS.gray}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setShowScheduleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.submitButton]} 
                onPress={handleSaveScheduleItem}
              >
                <Text style={styles.submitButtonText}>
                  {currentScheduleItem ? 'Update' : 'Add'} Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius - 4,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  // Date row styles
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius - 4,
    padding: 12,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addScheduleButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  scheduleList: {
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius - 4,
    padding: 12,
    marginBottom: 8,
    ...SHADOWS.light,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  scheduleLocation: {
    fontSize: 14,
    color: COLORS.gray,
  },
  scheduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  dayScrollView: {
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.buttonRadius - 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeField: {
    flex: 1,
    marginRight: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius - 4,
    padding: 12,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
});

export default CourseForm; 