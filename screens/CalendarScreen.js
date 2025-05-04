import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Calendar, CalendarList } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { 
  loadEventsFromStorage, 
  saveEventsToStorage, 
  formatDate 
} from '../utils/helpers';
import AddTaskForm from '../components/AddTaskForm';

const CalendarScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(formatDate(new Date()));
  const [events, setEvents] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  
  // Load events on component mount
  useEffect(() => {
    loadCalendarEvents();
  }, []);

  // Update marked dates when events change
  useEffect(() => {
    updateMarkedDates();
  }, [events]);

  const loadCalendarEvents = async () => {
    const loadedEvents = await loadEventsFromStorage();
    setEvents(loadedEvents);
  };

  const updateMarkedDates = () => {
    const marked = {};
    
    // First, mark the selected date
    marked[selected] = {
      selected: true,
      selectedColor: COLORS.primary,
    };
    
    // Then, mark dates with events
    Object.keys(events).forEach(date => {
      if (events[date]?.length > 0) {
        if (date === selected) {
          // If this date is also selected, merge the styles
          marked[date] = {
            ...marked[date],
            marked: true,
            dotColor: COLORS.secondary,
          };
        } else {
          marked[date] = {
            marked: true,
            dotColor: COLORS.secondary,
          };
        }
      }
    });
    
    setMarkedDates(marked);
  };

  const handleAddEvent = (eventData) => {
    const dateStr = eventData.dueDate;
    const newEvent = {
      id: Date.now().toString(),
      title: eventData.title,
      courseName: eventData.courseName,
      time: eventData.dueTime,
      notes: eventData.notes,
    };
    
    const updatedEvents = { ...events };
    
    if (!updatedEvents[dateStr]) {
      updatedEvents[dateStr] = [];
    }
    
    updatedEvents[dateStr].push(newEvent);
    setEvents(updatedEvents);
    saveEventsToStorage(updatedEvents);
    setModalVisible(false);
  };

  const renderEventsForSelectedDate = () => {
    const selectedDateEvents = events[selected] || [];
    
    if (selectedDateEvents.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No events for this date</Text>
          <Text style={styles.emptySubText}>Tap the + button to add an event</Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.eventsContainer}>
        {selectedDateEvents.map((event) => (
          <TouchableOpacity 
            key={event.id} 
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDetails', { event })}
          >
            <View style={styles.eventTime}>
              <Ionicons name="time-outline" size={18} color={COLORS.primary} />
              <Text style={styles.timeText}>{event.time}</Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventCourse}>{event.courseName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Tasks')}
        >
          <Ionicons name="list" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <Calendar
        style={styles.calendar}
        theme={{
          calendarBackground: COLORS.background,
          textSectionTitleColor: COLORS.text,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.white,
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.text,
          textDisabledColor: COLORS.lightGray,
          dotColor: COLORS.secondary,
          selectedDotColor: COLORS.white,
          arrowColor: COLORS.primary,
          monthTextColor: COLORS.primary,
          indicatorColor: COLORS.primary,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
        }}
        markingType={'dot'}
        markedDates={markedDates}
        onDayPress={day => {
          setSelected(day.dateString);
        }}
      />
      
      <View style={styles.eventSection}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventDate}>
            {new Date(selected).toDateString()}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {renderEventsForSelectedDate()}
      </View>

      {/* Modal for adding events */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AddTaskForm 
              onSubmit={handleAddEvent} 
              onCancel={() => setModalVisible(false)}
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
  calendar: {
    backgroundColor: COLORS.background,
    paddingBottom: 10,
  },
  eventSection: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.light,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  eventCourse: {
    fontSize: 14,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.gray,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
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

export default CalendarScreen; 