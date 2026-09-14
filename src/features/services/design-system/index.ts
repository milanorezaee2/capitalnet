// ─── Enterprise Design System ────────────────────────────────────────────────────────
// Inspired by: Stripe, Vercel, Linear, Notion, GitHub, Apple, Shopify, Webflow, Framer, Adobe
// Philosophy: Modern UI, Enterprise Design, Mobile First, Minimal, Accessible, Performant

// ── Typography Scale ───────────────────────────────────────────────────────────────

export const typography = {
  // Display
  displayXL: {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  displayL: {
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.015em',
  },
  displayM: {
    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  displayS: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: 700,
    lineHeight: 1.25,
  },
  
  // Headings
  h1: {
    fontSize: 'clamp(1.875rem, 4vw, 3rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  // Body
  bodyLarge: {
    fontSize: '1.125rem',
    fontWeight: 400,
    lineHeight: 1.7,
  },
  body: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // UI
  caption: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  overline: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  
  // Button
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  buttonLarge: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
} as const;

// ── Color Tokens ─────────────────────────────────────────────────────────────────────

export const colors = {
  // Primary Brand Colors
  primary: {
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
  
  // Secondary/Accent
  accent: {
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
    violet: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
    amber: {
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
  },
  
  // Semantic Colors
  success: {
    light: '#dcfce7',
    DEFAULT: '#22c55e',
    dark: '#15803d',
  },
  warning: {
    light: '#fef9c3',
    DEFAULT: '#eab308',
    dark: '#a16207',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1d4ed8',
  },
  
  // Neutral/Gray Scale
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Dark Mode Backgrounds
  background: {
    DEFAULT: '#020617', // slate-950
    surface: '#0f172a', // slate-900
    elevated: '#1e293b', // slate-800
    card: '#1e293b', // slate-800
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  
  // Borders
  border: {
    DEFAULT: 'rgba(255, 255, 255, 0.1)',
    light: 'rgba(255, 255, 255, 0.15)',
    heavy: 'rgba(255, 255, 255, 0.2)',
    accent: 'rgba(6, 182, 212, 0.3)',
  },
  
  // Text
  text: {
    primary: '#ffffff',
    secondary: '#cbd5e1', // slate-300
    tertiary: '#94a3b8', // slate-400
    muted: '#64748b', // slate-500
    inverse: '#020617',
  },
} as const;

// ── Radius Tokens ───────────────────────────────────────────────────────────────────

export const radius = {
  xs: '0.25rem',   // 4px
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.25rem', // 20px
  '3xl': '1.5rem',  // 24px
  '4xl': '2rem',    // 32px
  full: '9999px',
} as const;

// ── Shadow Tokens ───────────────────────────────────────────────────────────────────

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Colored shadows for modern feel
  glow: {
    cyan: '0 0 40px -10px rgba(6, 182, 212, 0.4)',
    violet: '0 0 40px -10px rgba(139, 92, 246, 0.4)',
    amber: '0 0 40px -10px rgba(245, 158, 11, 0.4)',
  },
  
  // Glass morphism
  glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
} as const;

// ── Spacing Scale (8px base) ─────────────────────────────────────────────────────────

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
  40: '10rem',   // 160px
  48: '12rem',   // 192px
  56: '14rem',   // 224px
  64: '16rem',   // 256px,
} as const;

// ── Animation Tokens ─────────────────────────────────────────────────────────────────

export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  // Easing
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Presets
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  stagger: {
    container: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },
} as const;

// ── Breakpoints ─────────────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ── Z-Index Scale ────────────────────────────────────────────────────────────────────

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  max: 9999,
} as const;

// ── Transitions ───────────────────────────────────────────────────────────────────────

export const transitions = {
  default: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// ── Glass Morphism Utilities ─────────────────────────────────────────────────────────

export const glass = {
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  heavy: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(20px)',
    border: 'rgba(255, 255, 255, 0.08)',
  },
} as const;

// ── Gradient Presets ─────────────────────────────────────────────────────────────────

export const gradients = {
  primary: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  accent: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  dark: 'linear-gradient(180deg, #020617 0%, #06111f 100%)',
  mesh: 'radial-gradient(circle at top, rgba(6,182,212,0.18), transparent 45%)',
  card: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(6,182,212,0.08))',
} as const;

// ── Export combined design system ─────────────────────────────────────────────────────

export const designSystem = {
  typography,
  colors,
  radius,
  shadows,
  spacing,
  animations,
  breakpoints,
  zIndex,
  transitions,
  glass,
  gradients,
} as const;

export type DesignSystem = typeof designSystem;
