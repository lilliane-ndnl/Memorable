import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { COURSE_COLORS } from '../constants/theme';

const TaskItem = ({ task, onPress, onComplete }) => {
  const priorityBadge = () => {
    let backgroundColor;
    let label;
    
    switch (task.priority) {
      case 'high':
        backgroundColor = COLORS.danger;
        label = 'High';
        break;
      case 'medium':
        backgroundColor = COLORS.warning;
        label = 'Medium';
        break;
      case 'low':
        backgroundColor = COLORS.success;
        label = 'Low';
        break;
      default:
        backgroundColor = COLORS.gray;
        label = 'Normal';
    }
    
    return (
      <View style={[styles.badge, { backgroundColor }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    );
  };

  const getCourseColor = () => {
    return COURSE_COLORS[task.courseName.toLowerCase()] || COURSE_COLORS.default;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        SHADOWS.light,
        { borderLeftColor: getCourseColor() },
        task.isCompleted && styles.completedTask
      ]} 
      onPress={() => onPress(task)}
    >
      <TouchableOpacity 
        style={styles.checkbox} 
        onPress={() => onComplete(task.id)}
      >
        {task.isCompleted ? (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color={COLORS.gray} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            style={[
              styles.title,
              task.isCompleted && styles.completedText
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {priorityBadge()}
        </View>
        
        <Text style={styles.course}>{task.courseName}</Text>
        
        <View style={styles.footer}>
          <View style={styles.dueInfo}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
            <Text style={styles.dueDate}>{task.getFormattedDueDate()}</Text>
          </View>
          <View style={styles.dueInfo}>
            <Ionicons name="time-outline" size={14} color={COLORS.gray} />
            <Text style={styles.dueTime}>{task.dueTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    flexDirection: 'row',
    borderLeftWidth: 4,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: COLORS.lightGray,
  },
  checkbox: {
    marginRight: SIZES.base,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  title: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  course: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.small,
  },
  footer: {
    flexDirection: 'row',
  },
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  dueDate: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 4,
  },
  dueTime: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginLeft: 4,
  },
  badge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 2,
    borderRadius: SIZES.base,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.small - 2,
    fontWeight: 'bold',
  },
});

export default TaskItem; 