import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../constants/theme';

const SubTaskList = ({ subTasks, onToggle, onDelete, editable = false }) => {
  // Render a single sub-task item
  const renderSubTask = ({ item, index }) => (
    <View style={styles.subTaskItem}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons 
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'} 
          size={22} 
          color={item.completed ? COLORS.success : COLORS.gray} 
        />
      </TouchableOpacity>
      
      <Text 
        style={[
          styles.subTaskTitle,
          item.completed && styles.completedTitle
        ]}
        numberOfLines={2}
      >
        {`${index + 1}. ${item.title}`}
      </Text>
      
      {editable && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {subTasks.length === 0 ? (
        <Text style={styles.emptyText}>No sub-tasks</Text>
      ) : (
        <FlatList
          data={subTasks}
          renderItem={renderSubTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  listContent: {
    paddingVertical: 8,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '50',
  },
  checkbox: {
    marginRight: 10,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTaskTitle: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    paddingRight: 10,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  }
});

export default SubTaskList; 