import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function GlassCard({ children, style, intensity = 'medium' }) {
  const { colors, sizes } = useTheme();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.glass,
        borderColor: colors.glassBorder,
        borderRadius: sizes.radius_l,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
    // Note: True backdrop filter blur is complex in RN without expo-blur or @react-native-community/blur
    // For now we use semi-transparent background to simulate glassmorphism
  }
});
