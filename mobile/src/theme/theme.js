export const COLORS = {
  // Primary Palette
  primary: '#6C3BFF', // Deep Purple
  secondary: '#8B5CF6', // Lighter Purple
  accent: '#06B6D4', // Cyan

  // Status Colors
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue

  // Light Theme Colors
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    card: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },

  // Dark Theme Colors
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    card: '#1E293B',
    glass: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  }
};

export const SIZES = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,

  // Border Radius for modern rounded corners
  radius_s: 8,
  radius_m: 16,
  radius_l: 24, // As requested in prompt (20-24px)
  radius_xl: 32,

  // Icon Sizes
  icon_s: 16,
  icon_m: 24,
  icon_l: 32,
};

export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  dark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  }
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '600' },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  subtitle: { fontSize: 14, fontWeight: '500', color: COLORS.light.textSecondary },
  caption: { fontSize: 12, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
};

export default { COLORS, SIZES, SHADOWS, TYPOGRAPHY };
