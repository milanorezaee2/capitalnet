/**
 * Enterprise Design System Tokens
 * Following Design Token methodology for consistency and scalability
 * Compatible with existing dark theme and RTL layout
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Primary Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Secondary Colors
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d3fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },

  // Accent Colors (Gold/Amber for enterprise feel)
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Teal/Cyan (existing brand color)
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },

  // Surface Colors (Dark theme compatible)
  surface: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Background Colors (Dark theme)
  background: {
    DEFAULT: '#030712',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Border Colors
  border: {
    DEFAULT: 'rgba(255, 255, 255, 0.1)',
    50: 'rgba(255, 255, 255, 0.05)',
    100: 'rgba(255, 255, 255, 0.1)',
    200: 'rgba(255, 255, 255, 0.15)',
    300: 'rgba(255, 255, 255, 0.2)',
    400: 'rgba(255, 255, 255, 0.25)',
    500: 'rgba(255, 255, 255, 0.3)',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Text Colors (Dark theme optimized)
  text: {
    DEFAULT: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
    muted: 'rgba(255, 255, 255, 0.6)',
    accent: '#8b5cf6',
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  fontFamily: {
    DEFAULT: "'Almarai', 'Segoe UI', Tahoma, sans-serif",
    sans: "'Almarai', 'Segoe UI', Tahoma, sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },

  fontSize: {
    // Display sizes
    'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
    'display-sm': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],

    // Heading sizes
    'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
    'h2': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
    'h3': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0' }],
    'h4': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0' }],

    // Body sizes
    'body-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0' }],
    'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
    'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],

    // Small sizes
    'small': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
    'caption': ['0.625rem', { lineHeight: '1.3', letterSpacing: '0.02em' }],
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

// ============================================================================
// SPACING TOKENS (8px base system)
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
  11: '2.75rem',  // 44px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  28: '7rem',     // 112px
  32: '8rem',     // 128px
  36: '9rem',     // 144px
  40: '10rem',    // 160px
  44: '11rem',    // 176px
  48: '12rem',    // 192px
  52: '13rem',    // 208px
  56: '14rem',    // 224px
  60: '15rem',    // 240px
  64: '16rem',    // 256px
  72: '18rem',    // 288px
  80: '20rem',    // 320px
  96: '24rem',    // 384px',
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',

  // Enterprise glass shadows
  'glass-sm': '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  'glass-md': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  'glass-xl': '0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.18)',

  // Glow effects
  'glow-sm': '0 0 20px rgba(99, 102, 241, 0.3)',
  'glow-md': '0 0 40px rgba(99, 102, 241, 0.4)',
  'glow-lg': '0 0 60px rgba(99, 102, 241, 0.5)',
  'glow-teal': '0 0 40px rgba(45, 212, 191, 0.3)',
  'glow-gold': '0 0 40px rgba(245, 158, 11, 0.3)',
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1500,
  popover: 1600,
  tooltip: 1700,
  notification: 1800,
  maximum: 9999,
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitions = {
  duration: {
    '75': '75ms',
    '100': '100ms',
    '150': '150ms',
    '200': '200ms',
    '300': '300ms',
    '500': '500ms',
    '700': '700ms',
    '1000': '1000ms',
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    enter: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animations = {
  // Fade animations
  'fade-in': 'fadeIn 0.3s ease-out',
  'fade-out': 'fadeOut 0.3s ease-in',
  'fade-in-up': 'fadeInUp 0.4s ease-out',
  'fade-in-down': 'fadeInDown 0.4s ease-out',

  // Slide animations
  'slide-in-right': 'slideInRight 0.3s ease-out',
  'slide-in-left': 'slideInLeft 0.3s ease-out',
  'slide-in-up': 'slideInUp 0.4s ease-out',
  'slide-in-down': 'slideInDown 0.4s ease-out',

  // Scale animations
  'scale-in': 'scaleIn 0.3s ease-out',
  'scale-out': 'scaleOut 0.3s ease-in',

  // Special animations
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'bounce-slow': 'bounce 2s infinite',
  'spin-slow': 'spin 3s linear infinite',

  // Custom enterprise animations
  'shimmer': 'shimmer 1.5s infinite',
  'glow': 'glow 2s ease-in-out infinite alternate',
  'float': 'float 3s ease-in-out infinite',
} as const;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
} as const;

// ============================================================================
// CONTAINER TOKENS
// ============================================================================

export const containers = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
  full: '100%',
} as const;

// ============================================================================
// GRADIENT TOKENS
// ============================================================================

export const gradients = {
  // Primary gradients
  primary: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  primaryLight: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
  primaryDark: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',

  // Secondary gradients
  secondary: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
  secondaryLight: 'linear-gradient(135deg, #e879f9 0%, #a78bfa 100%)',

  // Accent gradients
  accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  accentGold: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',

  // Teal gradients (brand color)
  teal: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
  tealLight: 'linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)',

  // Dark theme gradients
  dark: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
  darkSurface: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%)',

  // Glass gradients
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  glassStrong: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',

  // Mesh gradients
  mesh1: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
  mesh2: 'radial-gradient(at 0% 100%, rgba(34, 211, 238, 0.15) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
  mesh3: 'radial-gradient(at 50% 0%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',

  // Text gradients
  textGold: 'linear-gradient(135deg, #ffffff 0%, #eaf4ff 100%)',
  textTeal: 'linear-gradient(135deg, #00bcd4 0%, #4dd0e1 100%)',
  textPrimary: 'linear-gradient(135deg, #53d38a 0%, #8bc84c 50%, #f2c94c 100%)',
  textBrand: 'linear-gradient(90deg, #2ed3c9 0%, #39e0e8 100%)',
} as const;

// ============================================================================
// BACKDROP BLUR TOKENS
// ============================================================================

export const backdropBlur = {
  none: 'none',
  sm: 'blur(4px)',
  md: 'blur(8px)',
  lg: 'blur(16px)',
  xl: 'blur(24px)',
  '2xl': 'blur(40px)',
  '3xl': 'blur(64px)',
} as const;

// ============================================================================
// UTILITY TOKENS
// ============================================================================

export const utility = {
  // Max widths
  maxWidth: {
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    full: '100%',
  },

  // Heights
  minHeight: {
    0: '0',
    screen: '100vh',
    'screen-sm': '640px',
    'screen-md': '768px',
    'screen-lg': '1024px',
    'screen-xl': '1280px',
  },

  // Aspect ratios
  aspectRatio: {
    square: '1 / 1',
    video: '16 / 9',
    photo: '4 / 3',
    portrait: '3 / 4',
    banner: '21 / 9',
  },
} as const;

// ============================================================================
// COMPLETE DESIGN SYSTEM EXPORT
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  animations,
  breakpoints,
  containers,
  gradients,
  backdropBlur,
  utility,
} as const;

// ============================================================================
// CSS VARIABLES GENERATION (for Tailwind config)
// ============================================================================

export const generateCSSVariables = () => {
  return {
    // Colors
    '--color-primary-50': colors.primary[50],
    '--color-primary-500': colors.primary[500],
    '--color-primary-900': colors.primary[900],
    '--color-accent-500': colors.accent[500],
    '--color-teal-500': colors.teal[500],
    '--color-background': colors.background.DEFAULT,
    '--color-surface-900': colors.surface[900],
    '--color-text': colors.text.DEFAULT,
    '--color-text-muted': colors.text.muted,

    // Spacing
    '--spacing-xs': spacing[1],
    '--spacing-sm': spacing[2],
    '--spacing-md': spacing[4],
    '--spacing-lg': spacing[6],
    '--spacing-xl': spacing[8],
    '--spacing-2xl': spacing[12],

    // Border radius
    '--radius-sm': borderRadius.sm,
    '--radius-md': borderRadius.md,
    '--radius-lg': borderRadius.lg,
    '--radius-xl': borderRadius.xl,
    '--radius-full': borderRadius.full,

    // Shadows
    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    '--shadow-glass': shadows['glass-md'],
  };
};
