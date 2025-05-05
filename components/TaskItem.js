import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ProgressBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { COURSE_COLORS } from '../constants/theme';

const ASSIGNMENT_ICONS = {
  essay: 'document-text-outline',
  quiz: 'help-circle-outline',
  exam: 'school-outline',
  reading: 'book-outline',
  project: 'construct-outline',
  presentation: 'easel-outline',
  homework: 'create-outline',
  lab: 'flask-outline',
  paper: 'newspaper-outline',
  discussion: 'chatbubbles-outline',
  other: 'file-tray-outline',
};

// Task type categories for visual hierarchy
const TASK_CATEGORIES = {
  LECTURE: ['lecture'],
  STUDY: ['reading', 'study', 'discussion', 'study-sessions'],
  ASSESSMENT: ['exam', 'quiz', 'test'],
  ASSIGNMENT: ['homework', 'essay', 'paper', 'project', 'presentation', 'lab', 'other'],
};

const TaskItem = ({ 
  task, 
  onPress, 
  onToggleComplete, 
  onToggleSubTaskComplete,
  onDelete, 
  courseColor,
  groups = []
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Get the right icon for a task
  const getTaskIcon = (taskType) => {
    return ASSIGNMENT_ICONS[taskType] || ASSIGNMENT_ICONS.homework;
  };
  
  // Determine task category for visual hierarchy
  const getTaskCategory = (task) => {
    const type = task.type.toLowerCase();
    
    for (const [category, types] of Object.entries(TASK_CATEGORIES)) {
      if (types.includes(type)) {
        return category;
      }
    }
    
    // Default to ASSIGNMENT if no match
    return 'ASSIGNMENT';
  };
  
  // Get category style
  const getCategoryStyle = (category) => {
    switch (category) {
      case 'LECTURE':
        return styles.lectureTask;
      case 'STUDY':
        return styles.studyTask;
      case 'ASSESSMENT':
        return styles.assessmentTask;
      case 'ASSIGNMENT':
      default:
        return styles.assignmentTask;
    }
  };

  // Calculate completion percentage for subtasks
  const getCompletionPercentage = () => {
    if (!task.subTasks || task.subTasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    
    const completedCount = task.subTasks.filter(subTask => subTask.completed).length;
    return Math.round((completedCount / task.subTasks.length) * 100);
  };
  
  // Handle subtask toggle
  const handleSubTaskToggle = (subTaskId) => {
    if (onToggleSubTaskComplete) {
      onToggleSubTaskComplete(task.id, subTaskId);
    }
  };
  
  const completionPercentage = getCompletionPercentage();
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;
  const taskCategory = getTaskCategory(task);
  const categoryStyle = getCategoryStyle(taskCategory);
  
  // Find the group this task belongs to
  const taskGroup = groups.find(group => group.id === task.groupId);
  
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.taskItem,
          categoryStyle,
          { borderLeftColor: courseColor },
          task.completed && styles.completedTask
        ]}
        onPress={onPress}
      >
        <TouchableOpacity
          style={[
            styles.completeButton,
            task.completed && styles.completedButton
          ]}
          onPress={() => onToggleComplete(task.id)}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={18} color={COLORS.white} />
          )}
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
              {task.title}
            </Text>
            <Ionicons name={getTaskIcon(task.type)} size={20} color={courseColor} />
          </View>
          
          <View style={styles.taskDetails}>
            <Text style={styles.courseText}>{task.courseName}</Text>
            <Text style={styles.timeText}>{task.dueTime}</Text>
          </View>
          
          {/* Show group tag if task is in a group */}
          {taskGroup && (
            <View style={styles.taskGroupInfo}>
              <View 
                style={[styles.groupTag, { backgroundColor: taskGroup.color + '30' }]}
              >
                <Text style={[styles.groupTagText, { color: taskGroup.color }]}>
                  {taskGroup.name}
                </Text>
              </View>
            </View>
          )}
          
          {/* Show subtask progress if the task has subtasks */}
          {hasSubTasks && (
            <View style={styles.subtaskProgress}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarTrack}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${completionPercentage}%` },
                      completionPercentage === 100 && styles.progressComplete
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{completionPercentage}%</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.expandButton}
                onPress={() => setExpanded(!expanded)}
              >
                <Ionicons 
                  name={expanded ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color={COLORS.gray} 
                />
              </TouchableOpacity>
            </View>
          )}
          
          {task.notes && (
            <Text style={styles.notes} numberOfLines={2}>{task.notes}</Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(task.id)}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
      
      {/* Expanded subtasks */}
      {expanded && hasSubTasks && (
        <View style={styles.subtaskList}>
          {task.subTasks.map(subtask => (
            <View key={subtask.id} style={styles.subtaskItem}>
              <TouchableOpacity
                style={styles.subtaskToggle}
                onPress={() => handleSubTaskToggle(subtask.id)}
              >
                <Ionicons 
                  name={subtask.completed ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={16} 
                  color={subtask.completed ? COLORS.success : COLORS.gray} 
                />
              </TouchableOpacity>
              <Text 
                style={[
                  styles.subtaskTitle,
                  subtask.completed && styles.completedText
                ]}
              >
                {subtask.title}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    ...SHADOWS.light,
  },
  completedTask: {
    backgroundColor: COLORS.lightGray + '50',
    borderLeftWidth: 0,
  },
  taskContent: {
    flex: 1,
    marginLeft: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  taskDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  courseText: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  notes: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  completeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  // Task category styles for visual hierarchy
  lectureTask: {
    borderRightWidth: 4,
    borderRightColor: '#9C27B0', // Purple for lectures
  },
  studyTask: {
    borderRightWidth: 4,
    borderRightColor: '#009688', // Teal for study sessions
  },
  assessmentTask: {
    borderRightWidth: 4,
    borderRightColor: '#F44336', // Red for assessments
  },
  assignmentTask: {
    // Default style (no additional styling needed)
  },
  // Group tag styles
  taskGroupInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
  },
  groupTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  groupTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Subtask progress styles
  subtaskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 6,
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressComplete: {
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    width: 36,
  },
  expandButton: {
    padding: 4,
  },
  // Subtask list styles
  subtaskList: {
    backgroundColor: COLORS.lightGray + '30',
    borderRadius: 8,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 20,
    padding: 10,
    paddingTop: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '70',
  },
  subtaskToggle: {
    padding: 4,
    marginRight: 4,
  },
  subtaskTitle: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 4,
    flex: 1,
  },
});

export default TaskItem; 