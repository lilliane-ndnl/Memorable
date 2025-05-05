import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Modal,
  SafeAreaView,
  Alert,
  TextInput,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SIZES, COURSE_COLORS } from '../constants/theme';
import CourseForm from '../components/CourseForm';
import Course from '../models/Course';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  loadCoursesFromStorage, 
  saveCoursesToStorage, 
  generateCourseId 
} from '../utils/courseHelpers';

const { width } = Dimensions.get('window');
// Adjust folder width based on screen size
const FOLDER_WIDTH = Platform.OS === 'web' 
  ? Math.min(220, (width / 4) - 24) 
  : (width / 2) - 24;

const PREDEFINED_COLORS = Object.values(COURSE_COLORS);

const CoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Filter courses when search query or courses change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

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
            courseData.schedule,
            courseData.startDate,
            courseData.endDate
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
        courseData.schedule,
        courseData.startDate,
        courseData.endDate
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

  const renderCourseFolder = ({ item, index }) => {
    // Use a predefined color if it's a new course
    const folderColor = item.color || PREDEFINED_COLORS[index % PREDEFINED_COLORS.length];
    
    // Create gradient colors based on folder color
    const gradientColors = [
      lightenColor(folderColor, 20),
      folderColor,
      darkenColor(folderColor, 20)
    ];
    
    // Get course schedule info for display
    const scheduleInfo = item.schedule && item.schedule.length > 0 
      ? `${item.schedule.length} ${item.schedule.length === 1 ? 'session' : 'sessions'}`
      : 'No schedule';
    
    return (
      <TouchableOpacity 
        style={styles.folderContainer}
        onPress={() => handleEditCourse(item)}
        activeOpacity={0.9}
      >
        {/* Folder top flap */}
        <LinearGradient 
          colors={[gradientColors[0], gradientColors[1]]}
          style={styles.folderTop}
        >
          <View style={styles.folderTab} />
        </LinearGradient>
        
        {/* Folder body */}
        <LinearGradient 
          colors={gradientColors}
          style={styles.folderBody}
        >
          <View style={styles.labelContainer}>
            <Text style={styles.courseLabel}>{item.name.toUpperCase()}</Text>
          </View>
          
          <View style={styles.courseInfoRow}>
            <Text style={styles.scheduleText}>{scheduleInfo}</Text>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteCourse(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderAddFolderButton = () => (
    <TouchableOpacity 
      style={styles.addFolderButton}
      onPress={() => {
        setEditingCourse(null);
        setModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['rgba(142, 68, 173, 0.05)', 'rgba(142, 68, 173, 0.1)']}
        style={styles.addFolderContent}
      >
        <View style={styles.addIconContainer}>
          <Ionicons name="add" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.addFolderText}>Add Course</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Courses</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search */}
      {renderHeader()}
      
      {courses.length === 0 ? (
        <View style={styles.emptyCourses}>
          <Ionicons name="school-outline" size={72} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No courses added yet</Text>
          <Text style={styles.emptySubText}>
            Create course folders to keep track of course-related files
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              setEditingCourse(null);
              setModalVisible(true);
            }}
          >
            <View style={[styles.emptyButtonContent, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.emptyButtonText}>Add Course</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            renderItem={renderCourseFolder}
            numColumns={Platform.OS === 'web' ? 4 : 2}
            contentContainerStyle={styles.folderGrid}
            ListFooterComponent={renderAddFolderButton}
            showsVerticalScrollIndicator={false}
            key={Platform.OS === 'web' ? 'web-grid' : 'mobile-grid'}
          />
        </View>
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
  headerContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.buttonRadius,
    paddingHorizontal: 15,
    height: 48,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  // Folder grid styles
  folderGrid: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'flex-start',
  },
  folderContainer: {
    width: FOLDER_WIDTH,
    height: 170,
    margin: 10,
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  folderTop: {
    height: 40,
    borderTopLeftRadius: SIZES.buttonRadius,
    borderTopRightRadius: SIZES.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  folderTab: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
    height: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    top: 0,
  },
  folderBody: {
    flex: 1,
    borderBottomLeftRadius: SIZES.buttonRadius,
    borderBottomRightRadius: SIZES.buttonRadius,
    padding: 16,
    justifyContent: 'space-between',
  },
  labelContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginBottom: 10,
  },
  courseLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  courseInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add folder button
  addFolderButton: {
    width: FOLDER_WIDTH,
    height: 170,
    margin: 10,
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  addFolderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(142, 68, 173, 0.05)',
  },
  addIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(142, 68, 173, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addFolderText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  // Empty state
  emptyCourses: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 30,
    maxWidth: 300,
  },
  emptyButton: {
    width: 200,
    height: 50,
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  emptyButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.buttonRadius,
    padding: 20,
    maxHeight: '90%',
    ...SHADOWS.dark,
  },
});

// Helper functions to create gradient colors
const lightenColor = (color, percent) => {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);

  // Lighten
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const darkenColor = (color, percent) => {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);

  // Darken
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export default CoursesScreen; 