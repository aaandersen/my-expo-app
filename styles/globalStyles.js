import { Platform, StatusBar } from 'react-native';

export const colors = {
  primary: '#6B73FF', // 🔧 Ændre denne til din ønskede farve!
  // primary: '#FF6B6B', // ❤️ Rød 
  // primary: '#4ECDC4', // 💚 Teal
  // primary: '#45B7D1', // 💙 Blå
  // primary: '#96CEB4', // 💚 Mint
  // primary: '#FECA57', // 💛 Gul
  // primary: '#FF9FF3', // 💗 Pink
  // primary: '#54A0FF', // 💙 Lys blå
  // primary: '#5F27CD', // 💜 Lilla
  // primary: '#000000', // ⚫ Sort
  secondary: '#9C27B0',
  accent: '#FF5722',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999'
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  statusBar: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0
};

export const typography = {
  sizes: {
    small: 12,
    body: 14,
    title: 16,
    large: 18,
    heading: 20,
    display: 28
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: 'bold'
  }
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20
};

export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  }
};