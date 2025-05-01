import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, COURSE_COLORS } from '../constants/theme';

const EventDetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;
  
  // Get course color
  const getCourseColor = () => {
    return COURSE_COLORS[event.courseName.toLowerCase()] || COURSE_COLORS.default;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.card, { borderLeftColor: getCourseColor() }]}>
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="book-outline" size={20} color={getCourseColor()} />
              <Text style={styles.infoText}>{event.courseName}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>{event.time}</Text>
            </View>
          </View>
          
          {event.notes && event.notes.trim() !== '' && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{event.notes}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="pencil" size={24} color={COLORS.white} />
            <Text style={styles.actionText}>Edit Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              // TODO: Implement delete functionality
              navigation.goBack();
            }}
          >
            <Ionicons name="trash-outline" size={24} color={COLORS.white} />
            <Text style={styles.actionText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.additionalInfo}>
          <Text style={styles.infoHeader}>About this event</Text>
          <View style={styles.infoDetail}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
            <Text style={styles.infoDetailText}>
              Created on {new Date().toDateString()}
            </Text>
          </View>
          
          <View style={styles.infoDetail}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.gray} />
            <Text style={styles.infoDetailText}>
              Notification: 30 minutes before
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  backButton: {
    padding: SIZES.base,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: SIZES.medium,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.large,
    borderLeftWidth: 4,
    marginBottom: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SIZES.medium,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.large,
  },
  infoText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginLeft: SIZES.base,
  },
  notesContainer: {
    backgroundColor: COLORS.lightGray + '30',
    padding: SIZES.medium,
    borderRadius: SIZES.base,
  },
  notesLabel: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: SIZES.small,
  },
  notesText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.large,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginHorizontal: SIZES.base,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  actionText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: SIZES.base,
  },
  additionalInfo: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.large,
  },
  infoHeader: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.medium,
  },
  infoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  infoDetailText: {
    marginLeft: SIZES.small,
    color: COLORS.gray,
    fontSize: SIZES.font,
  },
});

export default EventDetailsScreen; 