import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Convert hex "#FF3B30" → "255 59 48" for CSS rgb() vars
function hexToRgbStr(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

// Lighten/darken a hex by a factor (-1 to +1)
function adjustHex(hex, factor) {
  const r = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) + 255 * factor)))
  const g = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) + 255 * factor)))
  const b = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) + 255 * factor)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function applyBrandColor(hex) {
  const shades = {
    '--brand-50':  adjustHex(hex, 0.85),
    '--brand-100': adjustHex(hex, 0.70),
    '--brand-200': adjustHex(hex, 0.50),
    '--brand-300': adjustHex(hex, 0.30),
    '--brand-400': adjustHex(hex, 0.12),
    '--brand-500': hex,
    '--brand-600': adjustHex(hex, -0.08),
    '--brand-700': adjustHex(hex, -0.18),
  }
  const root = document.documentElement
  Object.entries(shades).forEach(([key, value]) => {
    root.style.setProperty(key, hexToRgbStr(value))
  })
}

const DEFAULT_THEME = {
  app_name: 'FitTrack',
  primary_color: '#FF3B30',
  secondary_color: '#111116',
  logo: null,
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,

      applyTheme: (themeData) => {
        const merged = { ...DEFAULT_THEME, ...themeData }
        set({ theme: merged })
        if (typeof document !== 'undefined' && merged.primary_color) {
          applyBrandColor(merged.primary_color)
        }
      },

      initTheme: () => {
        const { theme } = get()
        if (typeof document !== 'undefined' && theme?.primary_color) {
          applyBrandColor(theme.primary_color)
        }
      },

      resetTheme: () => {
        set({ theme: DEFAULT_THEME })
        applyBrandColor(DEFAULT_THEME.primary_color)
      },
    }),
    {
      name: 'fittrack-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
