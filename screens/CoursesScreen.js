import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CourseForm from '../components/CourseForm';
import { COLORS, COURSE_COLORS, SHADOWS, SIZES } from '../constants/theme';
import Course from '../models/Course';
import {
  generateCourseId,
  loadCoursesFromStorage,
  saveCoursesToStorage
} from '../utils/courseHelpers';

const { width } = Dimensions.get('window');

// Calculate responsive grid dimensions
const getGridDimensions = () => {
  if (Platform.OS === 'web') {
    if (width > 1200) return { columns: 5, width: 220 };
    if (width > 900) return { columns: 4, width: 220 };
    if (width > 600) return { columns: 3, width: 200 };
    return { columns: 2, width: Math.min(220, (width / 2) - 32) };
  } 
  return { columns: 2, width: (width / 2) - 32 };
};

const { columns, width: FOLDER_WIDTH } = getGridDimensions();

const PREDEFINED_COLORS = Object.values(COURSE_COLORS);

const CoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [animatedValue] = useState(new Animated.Value(0));

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
      lightenColor(folderColor, 15),
      folderColor,
      darkenColor(folderColor, 15)
    ];
    
    // Get course abbreviation
    const getAbbreviation = (name) => {
      const words = name.split(' ');
      if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      } 
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    };

    // Get session days as abbreviations
    const getSessionDays = () => {
      if (!item.schedule || item.schedule.length === 0) return 'No schedule';
      
      const days = item.schedule.map(session => session.day.substring(0, 3));
      const uniqueDays = [...new Set(days)];
      return uniqueDays.join(', ');
    };
    
    return (
      <Pressable 
        style={({ pressed }) => [
          styles.folderContainer,
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
        ]}
        onPress={() => handleEditCourse(item)}
      >
        {/* Folder back */}
        <LinearGradient 
          colors={[darkenColor(folderColor, 25), darkenColor(folderColor, 15)]}
          style={styles.folderBack}
        />
        
        {/* Folder main */}
        <LinearGradient 
          colors={gradientColors}
          style={styles.folderMain}
        >
          <View style={styles.tabContainer}>
            <View style={[styles.folderTab, { backgroundColor: lightenColor(folderColor, 30) }]} />
          </View>
          
          {/* Course abbreviation circle */}
          <View style={styles.abbreviationContainer}>
            <Text style={styles.abbreviationText}>{getAbbreviation(item.name)}</Text>
          </View>
          
          {/* Course details */}
          <View style={styles.courseDetails}>
            <Text style={styles.courseName} numberOfLines={2} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.courseDays}>{getSessionDays()}</Text>
            
            {/* Action buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: lightenColor(folderColor, 30) }]}
                onPress={() => handleEditCourse(item)}
              >
                <Ionicons name="pencil" size={16} color={darkenColor(folderColor, 30)} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: lightenColor(folderColor, 30) }]}
                onPress={() => handleDeleteCourse(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color={darkenColor(folderColor, 30)} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
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
      <View style={styles.addFolderContent}>
        <View style={styles.addIconContainer}>
          <Ionicons name="add" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.addFolderText}>Add Course</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Courses</Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.trim() !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
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
            Create course folders to organize your academic schedule
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              setEditingCourse(null);
              setModalVisible(true);
            }}
          >
            <LinearGradient 
              colors={[COLORS.primary, darkenColor(COLORS.primary, 15)]} 
              style={styles.emptyButtonContent}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.white} style={{marginRight: 8}} />
              <Text style={styles.emptyButtonText}>Create First Course</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={filteredCourses}
            keyExtractor={(item) => item.id}
            renderItem={renderCourseFolder}
            numColumns={columns}
            key={`courses-grid-${columns}`}
            contentContainerStyle={styles.folderGrid}
            ListFooterComponent={renderAddFolderButton}
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
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
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
  },
  folderContainer: {
    width: FOLDER_WIDTH,
    height: 200,
    margin: 12,
    borderRadius: SIZES.buttonRadius,
    overflow: 'visible',
  },
  folderBack: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: FOLDER_WIDTH,
    height: 190,
    borderRadius: SIZES.buttonRadius,
    zIndex: 1,
  },
  folderMain: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: FOLDER_WIDTH,
    height: 190,
    borderRadius: SIZES.buttonRadius,
    padding: 0,
    zIndex: 2,
    ...SHADOWS.medium,
  },
  tabContainer: {
    height: 25,
    borderTopLeftRadius: SIZES.buttonRadius,
    borderTopRightRadius: SIZES.buttonRadius,
  },
  folderTab: {
    position: 'absolute',
    width: 60,
    height: 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    left: (FOLDER_WIDTH - 60) / 2,
    top: -15,
  },
  abbreviationContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  abbreviationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  courseDetails: {
    padding: 15,
    alignItems: 'center',
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 5,
    height: 40,
  },
  courseDays: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 'auto',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add folder button
  addFolderButton: {
    width: FOLDER_WIDTH,
    height: 190,
    margin: 12,
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(142, 68, 173, 0.05)',
    ...Platform.select({
      web: {
        transition: 'all 0.3s ease',
        ':hover': {
          transform: 'scale(1.03)',
          backgroundColor: 'rgba(142, 68, 173, 0.1)',
        }
      }
    })
  },
  addFolderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  addIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(142, 68, 173, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addFolderText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 18,
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
    lineHeight: 24,
  },
  emptyButton: {
    width: 220,
    height: 50,
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  emptyButtonContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
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