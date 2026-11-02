export const getColors = (isDark: boolean) => {
  if (isDark) {
    return {
      primary: '#F4CE6E',
      secondary: '#4A90E2',
      background: '#0F1419',
      surface: '#1A1F2E',
      surfaceLight: '#252B3D',
      white: '#E8EAED',
      black: '#FFFFFF',
      gray: '#8B92A5',
      border: '#2D3548',
      error: '#FF6B6B',
    };
  }

  return {
    primary: '#D4AF37',
    secondary: '#1a365d',
    background: '#F7FAFC',
    surface: '#FFFFFF',
    surfaceLight: '#FFFFFF',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#A0AEC0',
    border: '#E2E8F0',
    error: '#e74c3c',
  };
};

// For backwards compatibility - default to light mode
export const COLORS = getColors(false);

export const SIZES = {
  padding: 16,
  radius: 12,
  h1: 24,
  h2: 20,
  body: 16,
};

export const FONTS = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16 },
};
