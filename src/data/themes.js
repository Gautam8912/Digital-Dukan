/**
 * themes.js — storefront theme presets.
 * Each theme drives CSS custom properties applied on the storefront wrapper.
 */

export const THEMES = {
  modern: {
    id: 'modern',
    label: 'Purple Dream',
    tagline: 'Purple + Pink',
    c1: '#7c3aed',
    c2: '#ec4899',
    bg: '#faf7ff',
    surface: '#ffffff',
    text: '#251c38',
    grad: ['#8b5cf6', '#ec4899']
  },
  mango: {
    id: 'mango',
    label: 'Mango',
    tagline: 'Orange + Yellow',
    c1: '#ea580c',
    c2: '#f59e0b',
    bg: '#fffaf1',
    surface: '#ffffff',
    text: '#33210f',
    grad: ['#f97316', '#f59e0b']
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    tagline: 'Green + Cyan',
    c1: '#059669',
    c2: '#06b6d4',
    bg: '#f1fbf7',
    surface: '#ffffff',
    text: '#0e2b22',
    grad: ['#10b981', '#06b6d4']
  },
  royal: {
    id: 'royal',
    label: 'Royal',
    tagline: 'Blue + Violet',
    c1: '#4f46e5',
    c2: '#8b5cf6',
    bg: '#f5f7ff',
    surface: '#ffffff',
    text: '#1c1c33',
    grad: ['#3b82f6', '#8b5cf6']
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    tagline: 'Pink + Red',
    c1: '#e11d48',
    c2: '#f472b6',
    bg: '#fff5f7',
    surface: '#ffffff',
    text: '#33121a',
    grad: ['#f43f5e', '#fb7185']
  },
  luxury: {
    id: 'luxury',
    label: 'Luxury',
    tagline: 'Black + Gold',
    c1: '#1c1917',
    c2: '#ca8a04',
    bg: '#faf9f5',
    surface: '#ffffff',
    text: '#191512',
    grad: ['#292524', '#b45309']
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    tagline: 'Clean + Neutral',
    c1: '#334155',
    c2: '#64748b',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    grad: ['#334155', '#64748b']
  },
  festive: {
    id: 'festive',
    label: 'Festive',
    tagline: 'Crimson + Gold',
    c1: '#be123c',
    c2: '#d97706',
    bg: '#fff6f1',
    surface: '#ffffff',
    text: '#2b0a12',
    grad: ['#e11d48', '#f59e0b']
  },
  elegant: {
    id: 'elegant',
    label: 'Elegant',
    tagline: 'Plum + Champagne',
    c1: '#9d174d',
    c2: '#d8b26a',
    bg: '#fdf8f3',
    surface: '#ffffff',
    text: '#2d1220',
    grad: ['#9d174d', '#d8b26a']
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    tagline: 'Charcoal + Orange',
    c1: '#18181b',
    c2: '#f97316',
    bg: '#f6f5f4',
    surface: '#ffffff',
    text: '#131316',
    grad: ['#27272a', '#f97316']
  }
}

export const THEME_LIST = Object.values(THEMES)

export function getTheme(id) {
  return THEMES[id] || THEMES.modern
}

export const ACCENTS = [
  '#7c3aed',
  '#4f46e5',
  '#0ea5e9',
  '#059669',
  '#ca8a04',
  '#ea580c',
  '#e11d48',
  '#db2777',
  '#9d174d',
  '#18181b'
]

export const BUTTON_STYLES = [
  { id: 'gradient', label: 'Gradient' },
  { id: 'solid', label: 'Solid' },
  { id: 'soft', label: 'Soft' },
  { id: 'outline', label: 'Outline' }
]

export const FONTS = [
  {
    id: 'modern',
    label: 'Modern',
    stack: "'Manrope', 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  },
  {
    id: 'elegant',
    label: 'Elegant',
    stack: "'Playfair Display', Georgia, 'Times New Roman', serif"
  },
  {
    id: 'playful',
    label: 'Playful',
    stack: "'Baloo 2', 'Trebuchet MS', 'Comic Sans MS', sans-serif"
  }
]

export function getFont(id) {
  return FONTS.find((f) => f.id === id) || FONTS[0]
}

/**
 * Builds the CSS custom properties object for a themed storefront.
 * `brand` may override theme colors (accent) and shape (cardRadius, font).
 */
export function themeVars(themeId, brand = {}) {
  const t = getTheme(themeId)
  const primary = brand.accent || t.c1
  return {
    '--dd-primary': primary,
    '--dd-secondary': t.c2,
    '--dd-bg': t.bg,
    '--dd-surface': t.surface,
    '--dd-text': t.text,
    '--dd-grad-1': brand.accent || t.grad[0],
    '--dd-grad-2': t.grad[1],
    '--dd-radius': `${brand.cardRadius || 20}px`,
    '--dd-font': getFont(brand.font).stack
  }
}
