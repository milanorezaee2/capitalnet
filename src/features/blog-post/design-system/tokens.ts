/**
 * Design System Tokens
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all design decisions.
 * Import anywhere — zero runtime cost (const objects).
 */

// ─── Colour palette ───────────────────────────────────────────────────────────
export const colors = {
  // Base
  bg:        '#030712',      // page background
  surface:   '#0d1117',      // card / panel
  surface2:  '#161b22',      // elevated surface
  border:    'rgba(255,255,255,0.08)',
  border2:   'rgba(255,255,255,0.14)',

  // Text
  text:      '#f0f6fc',
  textMuted: 'rgba(255,255,255,0.55)',
  textDim:   'rgba(255,255,255,0.35)',

  // Brand
  teal:      '#14b8a6',
  tealLight: '#2dd4bf',
  tealDim:   'rgba(20,184,166,0.15)',
  amber:     '#f59e0b',
  amberDim:  'rgba(245,158,11,0.15)',
  violet:    '#8b5cf6',
  violetDim: 'rgba(139,92,246,0.15)',

  // Semantic
  success: '#10b981',
  successDim: 'rgba(16,185,129,0.12)',
  warning: '#f59e0b',
  warningDim: 'rgba(245,158,11,0.12)',
  error:   '#ef4444',
  errorDim: 'rgba(239,68,68,0.12)',
  info:    '#3b82f6',
  infoDim: 'rgba(59,130,246,0.12)',
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────
export const typography = {
  display:   { size: '3.75rem',  weight: 900, lineHeight: 1.05 },
  h1:        { size: '2.25rem',  weight: 800, lineHeight: 1.15 },
  h2:        { size: '1.625rem', weight: 700, lineHeight: 1.25 },
  h3:        { size: '1.25rem',  weight: 700, lineHeight: 1.35 },
  h4:        { size: '1.0625rem',weight: 600, lineHeight: 1.4  },
  bodyLarge: { size: '1.0625rem',weight: 400, lineHeight: 1.75 },
  body:      { size: '0.9375rem',weight: 400, lineHeight: 1.75 },
  small:     { size: '0.8125rem',weight: 400, lineHeight: 1.6  },
  caption:   { size: '0.75rem',  weight: 400, lineHeight: 1.5  },
} as const;

// ─── Border radii ─────────────────────────────────────────────────────────────
export const radii = {
  xs:   '6px',
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '20px',
  '2xl':'24px',
  full: '9999px',
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  xs:  '0 1px 3px rgba(0,0,0,0.4)',
  sm:  '0 4px 12px rgba(0,0,0,0.4)',
  md:  '0 8px 28px rgba(0,0,0,0.45)',
  lg:  '0 16px 48px rgba(0,0,0,0.5)',
  xl:  '0 24px 72px rgba(0,0,0,0.55)',
  teal:'0 0 0 3px rgba(20,184,166,0.25)',
} as const;

// ─── Spacing (4 px base) ──────────────────────────────────────────────────────
export const spacing = {
  1:  '4px',   2:  '8px',   3:  '12px',
  4:  '16px',  5:  '20px',  6:  '24px',
  7:  '28px',  8:  '32px',  10: '40px',
  12: '48px',  14: '56px',  16: '64px',
  20: '80px',
} as const;

// ─── Transitions ──────────────────────────────────────────────────────────────
export const transitions = {
  fast:   'all 0.12s ease',
  base:   'all 0.2s ease',
  smooth: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
} as const;
