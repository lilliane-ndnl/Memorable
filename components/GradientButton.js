import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';

const GradientButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  icon = null,
  size = 'medium',
  variant = 'primary'
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#4A90E2', '#357ABD']; // Blue gradient
      case 'success':
        return ['#2ECC71', '#27AE60']; // Green gradient
      case 'danger':
        return ['#E74C3C', '#C0392B']; // Red gradient
      default:
        return ['#4A90E2', '#357ABD'];
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: 12, fontSize: 14 };
      case 'large':
        return { height: 56, paddingHorizontal: 24, fontSize: 18 };
      default:
        return { height: 48, paddingHorizontal: 20, fontSize: 16 };
    }
  };

  const buttonSize = getButtonSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#CCCCCC', '#999999'] : getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { height: buttonSize.height, paddingHorizontal: buttonSize.paddingHorizontal }
        ]}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { fontSize: buttonSize.fontSize },
              textStyle,
              disabled && styles.disabledText
            ]}
          >
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.buttonRadius,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    color: COLORS.white,
    opacity: 0.7,
  },
});

export default GradientButton; 