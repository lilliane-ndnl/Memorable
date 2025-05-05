import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { formatDate } from '../utils/helpers';

const SubTaskList = ({ subTasks, onChange, parentDueDate }) => {
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [editingSubTaskId, setEditingSubTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Generate a new sub-task
  const createNewSubTask = () => {
    if (!newSubTaskTitle.trim()) {
      return;
    }
    
    const newSubTask = {
      id: Date.now().toString(),
      title: newSubTaskTitle.trim(),
      completed: false,
      dueDate: parentDueDate, // Default to parent's due date
      createdAt: new Date().toISOString()
    };
    
    onChange([...subTasks, newSubTask]);
    setNewSubTaskTitle('');
  };
  
  // Toggle sub-task completion
  const toggleSubTaskComplete = (id) => {
    const updatedSubTasks = subTasks.map(subTask => {
      if (subTask.id === id) {
        return { ...subTask, completed: !subTask.completed };
      }
      return subTask;
    });
    
    onChange(updatedSubTasks);
  };
  
  // Delete a sub-task
  const deleteSubTask = (id) => {
    Alert.alert(
      "Delete Sub-Task",
      "Are you sure you want to delete this sub-task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedSubTasks = subTasks.filter(subTask => subTask.id !== id);
            onChange(updatedSubTasks);
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // Begin editing a sub-task
  const startEditSubTask = (subTask) => {
    setEditingSubTaskId(subTask.id);
    setEditTitle(subTask.title);
  };
  
  // Save edited sub-task
  const saveEditSubTask = () => {
    if (!editTitle.trim()) {
      return;
    }
    
    const updatedSubTasks = subTasks.map(subTask => {
      if (subTask.id === editingSubTaskId) {
        return { ...subTask, title: editTitle.trim() };
      }
      return subTask;
    });
    
    onChange(updatedSubTasks);
    setEditingSubTaskId(null);
    setEditTitle('');
  };
  
  // Cancel editing
  const cancelEditSubTask = () => {
    setEditingSubTaskId(null);
    setEditTitle('');
  };
  
  // Update sub-task due date
  const updateSubTaskDueDate = (id, date) => {
    const updatedSubTasks = subTasks.map(subTask => {
      if (subTask.id === id) {
        return { ...subTask, dueDate: date };
      }
      return subTask;
    });
    
    onChange(updatedSubTasks);
  };

  // Render a sub-task item
  const renderSubTaskItem = ({ item }) => {
    const isEditing = item.id === editingSubTaskId;
    
    return (
      <View style={styles.subTaskItem}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            item.completed && styles.completedButton
          ]}
          onPress={() => toggleSubTaskComplete(item.id)}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color={COLORS.white} />
          )}
        </TouchableOpacity>
        
        <View style={styles.subTaskContent}>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              autoFocus
              onSubmitEditing={saveEditSubTask}
            />
          ) : (
            <Text style={[
              styles.subTaskTitle,
              item.completed && styles.completedText
            ]}>
              {item.title}
            </Text>
          )}
          
          {!isEditing && item.dueDate && (
            <Text style={styles.subTaskDate}>
              Due: {formatDate(new Date(item.dueDate))}
            </Text>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={cancelEditSubTask}
              >
                <Ionicons name="close" size={18} color={COLORS.danger} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={saveEditSubTask}
              >
                <Ionicons name="checkmark" size={18} color={COLORS.success} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => startEditSubTask(item)}
              >
                <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteSubTask(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  // Calculate completion percentage
  const completionPercentage = subTasks.length > 0
    ? Math.round((subTasks.filter(st => st.completed).length / subTasks.length) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Sub-tasks</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{completionPercentage}%</Text>
        </View>
      </View>
      
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={newSubTaskTitle}
          onChangeText={setNewSubTaskTitle}
          placeholder="Add a sub-task..."
          placeholderTextColor={COLORS.gray}
          onSubmitEditing={createNewSubTask}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={createNewSubTask}
          disabled={!newSubTaskTitle.trim()}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      {subTasks.length > 0 ? (
        <FlatList
          data={subTasks}
          renderItem={renderSubTaskItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Break down your assignment into smaller steps
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 100,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  addContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  list: {
    maxHeight: 200,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    ...SHADOWS.light,
  },
  completeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  subTaskContent: {
    flex: 1,
    marginLeft: 10,
  },
  subTaskTitle: {
    fontSize: 14,
    color: COLORS.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  subTaskDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  editInput: {
    fontSize: 14,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    padding: 0,
    paddingBottom: 2,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: COLORS.lightGray + '50',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  }
});

export default SubTaskList; 