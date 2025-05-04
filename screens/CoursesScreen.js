import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Modal,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import CourseForm from '../components/CourseForm';
import Course from '../models/Course';
import { 
  loadCoursesFromStorage, 
  saveCoursesToStorage, 
  generateCourseId 
} from '../utils/courseHelpers';

const CoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const loadedCourses = await loadCoursesFromStorage();
    setCourses(loadedCourses);
  };

  const handleAddCourse = (courseData) => {
    if (editingCourse) {
      // Update existing course
      const updatedCourses = courses.map(course => {
        if (course.id === editingCourse.id) {
          return new Course(
            course.id,
            courseData.name,
            courseData.color,
            courseData.schedule
          );
        }
        return course;
      });
      
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);
    } else {
      // Create new course
      const newCourse = new Course(
        generateCourseId(),
        courseData.name,
        courseData.color,
        courseData.schedule
      );
      
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      saveCoursesToStorage(updatedCourses);
    }
    
    setModalVisible(false);
    setEditingCourse(null);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setModalVisible(true);
  };

  const handleDeleteCourse = (courseId) => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedCourses = courses.filter(course => course.id !== courseId);
            setCourses(updatedCourses);
            saveCoursesToStorage(updatedCourses);
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderCourseItem = ({ item }) => (
    <View style={[styles.courseItem, { borderLeftColor: item.color }]}>
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.name}</Text>
        {item.schedule && item.schedule.length > 0 ? (
          <Text style={styles.scheduleCount}>{item.schedule.length} class sessions</Text>
        ) : (
          <Text style={styles.noSchedule}>No class schedule set</Text>
        )}
      </View>
      <View style={styles.courseActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditCourse(item)}
        >
          <Ionicons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteCourse(item.id)}
        >
          <Ionicons name="trash" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Courses</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            setEditingCourse(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {courses.length === 0 ? (
        <View style={styles.emptyCourses}>
          <Ionicons name="school-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No courses added yet</Text>
          <Text style={styles.emptySubText}>
            Add your first course to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourseItem}
          contentContainerStyle={styles.courseList}
        />
      )}
      
      {/* Add/Edit Course Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setEditingCourse(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CourseForm 
              onSubmit={handleAddCourse} 
              onCancel={() => {
                setModalVisible(false);
                setEditingCourse(null);
              }}
              initialCourse={editingCourse}
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
  courseList: {
    padding: 16,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...SHADOWS.light,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  scheduleCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  noSchedule: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  courseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyCourses: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 50,
    ...SHADOWS.dark,
  },
});

export default CoursesScreen; 