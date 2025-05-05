import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import SubTaskList from './SubTaskList';

const TaskItem = ({
  task,
  onPress,
  onToggleComplete,
  onToggleSubtask,
  onDelete,
  style
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Toggle expanded state with animation
  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false
    }).start();
    
    setExpanded(!expanded);
  };

  // Animated height for the expanded content
  const expandHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, task.subTasks && task.subTasks.length > 0 ? task.subTasks.length * 50 + 10 : 50]
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get the task deadline text
  const getDeadlineText = () => {
    if (!task.dueDate) return 'No deadline';

    let text = formatDate(task.dueDate);
    
    if (task.dueTime) {
      text += ` at ${formatTime(task.dueTime)}`;
    }
    
    return text;
  };

  // Get status badge type and text
  const getStatusBadge = () => {
    if (task.isCompleted) {
      return {
        text: 'Completed',
        color: COLORS.success,
        icon: 'checkmark-circle'
      };
    }
    
    if (task.isOverdue()) {
      return {
        text: 'Overdue',
        color: COLORS.danger,
        icon: 'alert-circle'
      };
    }
    
    if (task.isDueToday()) {
      return {
        text: 'Due Today',
        color: '#FFA500', // Orange
        icon: 'time'
      };
    }
    
    if (task.isDueSoon()) {
      return {
        text: 'Due Soon',
        color: '#FF9800', // Amber
        icon: 'time'
      };
    }
    
    return {
      text: 'Upcoming',
      color: COLORS.primary,
      icon: 'calendar'
    };
  };

  const statusBadge = getStatusBadge();
  const completionPercentage = task.getCompletionPercentage();
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;
  
  return (
    <View style={[styles.container, style]}>
      {/* Task header - always visible */}
      <View style={styles.header}>
        {/* Checkbox */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            task.isCompleted && styles.checkboxChecked
          ]}
          onPress={() => onToggleComplete(task.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {task.isCompleted && (
            <Ionicons name="checkmark" size={18} color={COLORS.white} />
          )}
        </TouchableOpacity>
        
        {/* Task info */}
        <TouchableOpacity 
          style={styles.infoContainer} 
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.titleRow}>
            <Text 
              style={[
                styles.title, 
                task.isCompleted && styles.completedTitle
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
            {/* Priority indicator */}
            <View 
              style={[
                styles.priorityIndicator, 
                { backgroundColor: task.getPriorityColor() }
              ]} 
            />
          </View>
          
          <View style={styles.metaRow}>
            {/* Category badge */}
            <View style={styles.categoryBadge}>
              <Ionicons 
                name={task.getCategoryIconName()} 
                size={12} 
                color={COLORS.primary} 
                style={styles.categoryIcon} 
              />
              <Text style={styles.categoryText}>
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Text>
            </View>
            
            {/* Deadline */}
            {task.dueDate && (
              <View style={styles.deadlineBadge}>
                <Ionicons 
                  name="calendar-outline" 
                  size={12} 
                  color={COLORS.gray} 
                  style={styles.deadlineIcon} 
                />
                <Text style={styles.deadlineText}>
                  {getDeadlineText()}
                </Text>
              </View>
            )}
            
            {/* Course badge */}
            {task.courseName && (
              <View style={styles.courseBadge}>
                <Ionicons 
                  name="school-outline" 
                  size={12} 
                  color={COLORS.gray} 
                  style={styles.courseIcon} 
                />
                <Text style={styles.courseText} numberOfLines={1}>
                  {task.courseName}
                </Text>
              </View>
            )}
          </View>
          
          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '20' }]}>
            <Ionicons name={statusBadge.icon} size={12} color={statusBadge.color} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusBadge.color }]}>{statusBadge.text}</Text>
          </View>
          
          {/* Progress bar for sub-tasks */}
          {hasSubTasks && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${completionPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{`${completionPercentage}%`}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          {hasSubTasks && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={toggleExpand}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={expanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={COLORS.gray} 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Expandable content */}
      {hasSubTasks && (
        <Animated.View style={[styles.expandContent, { height: expandHeight }]}>
          <SubTaskList 
            subTasks={task.subTasks} 
            onToggle={(subTaskId) => onToggleSubtask(task.id, subTaskId)} 
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.buttonRadius,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    marginBottom: 12,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 4,
  },
  deadlineIcon: {
    marginRight: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
    maxWidth: 120,
  },
  courseIcon: {
    marginRight: 4,
  },
  courseText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    width: 35,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  expandContent: {
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
});

export default TaskItem; 