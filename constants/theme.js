export const COLORS = {
  primary: '#4A6FFF', // Softer blue as primary color
  secondary: '#E3E9FF', // Very light blue for secondary elements
  tertiary: '#F5F7FF', // Even lighter blue for tertiary elements
  background: '#FFFFFF', // Pure white background for minimalist look
  white: '#FFFFFF',
  black: '#1E1E1E', // Darker black for better contrast
  gray: '#8A8A8A', // Medium gray
  lightGray: '#F2F2F2', // Very light gray for subtle dividers
  danger: '#FF5A5A', // Softer red
  warning: '#FFCC4D', // Amber for warnings
  success: '#5AC464', // Soft green for success
  text: '#3A3A3A', // Slightly softer than black for main text
  textSecondary: '#757575', // Secondary text color
  border: '#EFEFEF', // Light border color
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  xxl: 32,
  // Desktop specific sizes
  maxContentWidth: 1200,
  sidebarWidth: 280,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 8,
  },
};

export const COURSE_COLORS = {
  math: '#8E7CEF', // Purple
  science: '#67E7CA', // Mint
  history: '#FD9CA9', // Pink
  english: '#FFCC4D', // Yellow
  art: '#FF6B6B', // Red
  cs: '#63D471', // Green
  business: '#6FB2E0', // Blue
  default: '#ADADAD', // Gray
};

// Desktop specific styles
export const LAYOUT = {
  desktop: {
    padding: 24,
    borderRadius: 12,
  }
};

export default { COLORS, SIZES, FONTS, SHADOWS, COURSE_COLORS, LAYOUT }; 