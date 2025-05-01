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
import { COLORS, SIZES } from '../constants/theme';
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
          calendarBackground: COLORS.white,
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
  calendar: {
    borderRadius: SIZES.base,
    elevation: 2,
    margin: SIZES.medium,
  },
  eventSection: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.medium,
    marginTop: SIZES.small,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  eventDate: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...COLORS.SHADOWS,
  },
  eventsContainer: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  timeText: {
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  eventCourse: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.extraLarge,
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

export default CalendarScreen; 