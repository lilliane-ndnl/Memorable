export const COLORS = {
  primary: '#8E7CEF', // Main light purple color
  secondary: '#FD9CA9', // Soft pink for accents
  tertiary: '#67E7CA', // Mint green for additional highlights
  background: '#FCFCFF', // Very light background
  white: '#FFFFFF',
  black: '#333333', // Soft black
  gray: '#ADADAD',
  lightGray: '#E6E6E6',
  danger: '#FF6B6B', // For high priority tasks
  warning: '#FFCC4D', // For medium priority
  success: '#63D471', // For low priority
  text: '#383838',
  border: '#EFEFEF',
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