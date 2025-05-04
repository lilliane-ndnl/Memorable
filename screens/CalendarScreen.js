import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../constants/theme';
import { loadCoursesFromStorage, getCoursesAsMarkedDates } from '../utils/courseHelpers';

// View mode constants
const VIEW_MODES = {
  DAY: '1_day',
  THREE_DAYS: '3_days',
  WEEK: '7_days',
  MONTH: 'month'
};

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH);
  const [courses, setCourses] = useState([]);
  
  // Load courses
  useEffect(() => {
    loadCourses();
  }, []);
  
  // Update marked dates when courses change
  useEffect(() => {
    if (courses.length > 0) {
      const courseMarkedDates = getCoursesAsMarkedDates(courses);
      
      // Merge with existing marked dates
      setMarkedDates(prevMarkedDates => ({
        ...courseMarkedDates,
        ...prevMarkedDates,
        [selectedDate]: {
          ...courseMarkedDates[selectedDate],
          ...prevMarkedDates[selectedDate],
          selected: true,
          selectedColor: COLORS.primary,
        }
      }));
    }
  }, [courses, selectedDate]);
  
  const loadCourses = async () => {
    const loadedCourses = await loadCoursesFromStorage();
    setCourses(loadedCourses);
  };
  
  // Change the view mode
  const changeViewMode = (mode) => {
    setViewMode(mode);
  };
  
  // Get formatted header text based on the current view mode and selected date
  const getHeaderText = () => {
    const dateObj = new Date(selectedDate);
    const options = { month: 'long', year: 'numeric' };
    
    switch (viewMode) {
      case VIEW_MODES.DAY:
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      case VIEW_MODES.THREE_DAYS:
        const threeDaysLater = new Date(dateObj);
        threeDaysLater.setDate(dateObj.getDate() + 2);
        return `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${threeDaysLater.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case VIEW_MODES.WEEK:
        const weekLater = new Date(dateObj);
        weekLater.setDate(dateObj.getDate() + 6);
        return `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekLater.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case VIEW_MODES.MONTH:
      default:
        return dateObj.toLocaleDateString('en-US', options);
    }
  };
  
  // Navigate to the courses screen
  const navigateToCourses = () => {
    navigation.navigate('Courses');
  };
  
  // Generate time slots for day view
  const getTimeSlots = () => {
    const slots = [];
    for (let i = 7; i < 23; i++) {
      const hour = i > 12 ? i - 12 : i;
      const meridiem = i >= 12 ? 'PM' : 'AM';
      slots.push(`${hour}:00 ${meridiem}`);
    }
    return slots;
  };
  
  // Get events for a specific day
  const getEventsForDay = (date) => {
    const dayEvents = [];
    
    // Add course schedule events for this day
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    courses.forEach(course => {
      course.schedule.forEach(session => {
        if (session.day === day) {
          dayEvents.push({
            id: `${course.id}_${session.id}`,
            title: course.name,
            time: `${session.startTime} - ${session.endTime}`,
            location: session.location || '',
            color: course.color,
            type: 'course'
          });
        }
      });
    });
    
    // Here you would also add task events
    // TODO: Add task events
    
    return dayEvents.sort((a, b) => {
      // Sort by start time
      const aTime = a.time.split(' - ')[0];
      const bTime = b.time.split(' - ')[0];
      return aTime.localeCompare(bTime);
    });
  };
  
  // Generate dates for multi-day views
  const getDatesForView = () => {
    const dateObj = new Date(selectedDate);
    const dates = [];
    
    let daysToShow = 1;
    if (viewMode === VIEW_MODES.THREE_DAYS) daysToShow = 3;
    if (viewMode === VIEW_MODES.WEEK) daysToShow = 7;
    
    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(dateObj);
      currentDate.setDate(dateObj.getDate() + i);
      dates.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: currentDate.getDate()
      });
    }
    
    return dates;
  };
  
  // Render day, 3-day, or week view
  const renderMultiDayView = () => {
    const dates = getDatesForView();
    
    return (
      <View style={styles.multiDayContainer}>
        <View style={styles.daysHeader}>
          {dates.map(date => (
            <View key={date.date} style={styles.dayHeaderItem}>
              <Text style={styles.dayName}>{date.dayName}</Text>
              <Text style={styles.dayNumber}>{date.dayNumber}</Text>
            </View>
          ))}
        </View>
        
        <ScrollView style={styles.timelineContainer}>
          {getTimeSlots().map(timeSlot => (
            <View key={timeSlot} style={styles.timeRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{timeSlot}</Text>
              </View>
              
              <View style={styles.eventsContainer}>
                {dates.map(date => {
                  const eventsAtTime = getEventsForDay(date.date).filter(
                    event => event.time.startsWith(timeSlot.split(' ')[0])
                  );
                  
                  return (
                    <View key={`${date.date}_${timeSlot}`} style={styles.dayColumn}>
                      {eventsAtTime.map(event => (
                        <TouchableOpacity
                          key={event.id}
                          style={[styles.eventItem, { backgroundColor: event.color + '20', borderLeftColor: event.color }]}
                        >
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventTime}>{event.time}</Text>
                          {event.location && (
                            <Text style={styles.eventLocation}>{event.location}</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // Render the appropriate calendar view based on view mode
  const renderCalendarView = () => {
    if (viewMode === VIEW_MODES.MONTH) {
      return (
        <Calendar
          style={styles.calendar}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: COLORS.primary,
            }
          }}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markingType={'multi-dot'}
          theme={{
            calendarBackground: COLORS.background,
            textSectionTitleColor: COLORS.text,
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: COLORS.white,
            todayTextColor: COLORS.primary,
            dayTextColor: COLORS.text,
            textDisabledColor: COLORS.gray,
            dotColor: COLORS.primary,
            selectedDotColor: COLORS.white,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.text,
            indicatorColor: COLORS.primary,
          }}
        />
      );
    } else {
      return renderMultiDayView();
    }
  };
  
  // Render daily events list (for month view)
  const renderDailyEvents = () => {
    const dailyEvents = getEventsForDay(selectedDate);
    
    return (
      <View style={styles.eventSection}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>Events for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
        </View>
        
        {dailyEvents.length === 0 ? (
          <View style={styles.noEvents}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.lightGray} />
            <Text style={styles.noEventsText}>No events for this day</Text>
          </View>
        ) : (
          <FlatList
            data={dailyEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.eventListItem, { borderLeftColor: item.color }]}
              >
                <View style={styles.eventItemContent}>
                  <Text style={styles.eventName}>{item.title}</Text>
                  <Text style={styles.eventTimeText}>{item.time}</Text>
                  {item.location && (
                    <Text style={styles.locationText}>
                      <Ionicons name="location-outline" size={12} color={COLORS.gray} /> {item.location}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.eventList}
          />
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getHeaderText()}</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={navigateToCourses}
        >
          <Ionicons name="school" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.viewModeSelector}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === VIEW_MODES.DAY && styles.activeViewModeButton
          ]}
          onPress={() => changeViewMode(VIEW_MODES.DAY)}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === VIEW_MODES.DAY && styles.activeViewModeText
            ]}
          >
            1 Day
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === VIEW_MODES.THREE_DAYS && styles.activeViewModeButton
          ]}
          onPress={() => changeViewMode(VIEW_MODES.THREE_DAYS)}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === VIEW_MODES.THREE_DAYS && styles.activeViewModeText
            ]}
          >
            3 Days
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === VIEW_MODES.WEEK && styles.activeViewModeButton
          ]}
          onPress={() => changeViewMode(VIEW_MODES.WEEK)}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === VIEW_MODES.WEEK && styles.activeViewModeText
            ]}
          >
            7 Days
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === VIEW_MODES.MONTH && styles.activeViewModeButton
          ]}
          onPress={() => changeViewMode(VIEW_MODES.MONTH)}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === VIEW_MODES.MONTH && styles.activeViewModeText
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>
      
      {renderCalendarView()}
      
      {viewMode === VIEW_MODES.MONTH && renderDailyEvents()}
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
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  viewModeSelector: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  viewModeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeViewModeButton: {
    backgroundColor: COLORS.primary,
  },
  viewModeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeViewModeText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  calendar: {
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  eventList: {
    padding: 16,
  },
  eventListItem: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    borderLeftWidth: 3,
    ...SHADOWS.light,
  },
  eventItemContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  eventTimeText: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  noEvents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEventsText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  // Multi-day view styles
  multiDayContainer: {
    flex: 1,
  },
  daysHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dayHeaderItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  dayName: {
    fontSize: 14,
    color: COLORS.gray,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  timelineContainer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  timeColumn: {
    width: 60,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: COLORS.lightGray,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  eventsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: COLORS.lightGray,
    padding: 2,
  },
  eventItem: {
    padding: 6,
    borderRadius: 4,
    borderLeftWidth: 2,
    marginBottom: 2,
    ...SHADOWS.light,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  eventTime: {
    fontSize: 10,
    color: COLORS.gray,
  },
  eventLocation: {
    fontSize: 10,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});

export default CalendarScreen; 