import AsyncStorage from '@react-native-async-storage/async-storage';
import Course from '../models/Course';

const COURSES_STORAGE_KEY = '@memorable_courses';

export const generateCourseId = () => {
  return Date.now().toString();
};

export const saveCoursesToStorage = async (courses) => {
  try {
    const serializedCourses = JSON.stringify(courses);
    await AsyncStorage.setItem(COURSES_STORAGE_KEY, serializedCourses);
    return true;
  } catch (error) {
    console.error('Error saving courses:', error);
    return false;
  }
};

export const loadCoursesFromStorage = async () => {
  try {
    const serializedCourses = await AsyncStorage.getItem(COURSES_STORAGE_KEY);
    
    if (!serializedCourses) {
      return [];
    }
    
    const coursesData = JSON.parse(serializedCourses);
    
    // Convert plain objects to Course instances
    return coursesData.map(course => 
      new Course(
        course.id,
        course.name,
        course.color,
        course.schedule
      )
    );
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
};

export const getCoursesAsMarkedDates = (courses) => {
  const markedDates = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  
  // Create a mapping of weekday sessions
  courses.forEach(course => {
    course.schedule.forEach(session => {
      const dayIndex = days.indexOf(session.day);
      if (dayIndex !== -1) {
        // Get all dates for this weekday in the next 2 months
        for (let i = 0; i < 60; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          if (date.getDay() === dayIndex) {
            const dateString = date.toISOString().split('T')[0];
            
            if (!markedDates[dateString]) {
              markedDates[dateString] = { dots: [] };
            }
            
            // Add course as a dot
            if (!markedDates[dateString].dots.some(dot => dot.color === course.color)) {
              markedDates[dateString].dots.push({
                key: course.id,
                color: course.color,
              });
            }
          }
        }
      }
    });
  });
  
  return markedDates;
};

export const getDaysOfWeek = () => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
};

export const getDefaultCourseColors = () => {
  return [
    '#4A6FFF', // Blue
    '#FF5A5A', // Red
    '#5AC464', // Green
    '#FFCC4D', // Yellow
    '#8E7CEF', // Purple
    '#FD9CA9', // Pink
    '#67E7CA', // Mint
    '#6FB2E0', // Light Blue
  ];
};

export default {
  saveCoursesToStorage,
  loadCoursesFromStorage,
  generateCourseId,
  getCoursesAsMarkedDates,
  getDaysOfWeek,
  getDefaultCourseColors,
}; 