import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Button({ 
  title, 
  onPress, 
  type = 'primary', // primary, secondary, outline, text
  isLoading = false,
  disabled = false,
  style,
  textStyle
}) {
  const { colors, sizes, typography, shadows } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (type) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (type) {
      case 'primary': 
      case 'secondary': return '#FFFFFF';
      case 'outline': 
      case 'text': return colors.primary;
      default: return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.border;
    return type === 'outline' ? colors.primary : 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: type === 'outline' ? 2 : 0,
          borderRadius: sizes.radius_m,
        },
        type === 'primary' && !disabled ? shadows.medium : {},
        style
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[
          typography.button,
          { color: getTextColor() },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
  }
});
