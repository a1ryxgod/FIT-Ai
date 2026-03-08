/**
 * Global Chart.js defaults for dark theme
 * Import this once in main.jsx to apply globally
 */
import { Chart } from 'chart.js'

export function applyChartDefaults() {
  const d = Chart.defaults

  d.color = 'rgba(148, 163, 184, 0.8)'
  d.borderColor = 'rgba(255, 255, 255, 0.06)'
  d.font.family = 'Inter, system-ui, sans-serif'
  d.font.size = 12
  d.responsive = true
  d.maintainAspectRatio = false
  d.animation = { duration: 600, easing: 'easeInOutQuart' }

  // Plugins — use set() to safely create nested paths
  Chart.defaults.set('plugins.legend', { display: false })
  Chart.defaults.set('plugins.tooltip', {
    backgroundColor: 'rgba(15, 15, 17, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    padding: 10,
    titleColor: '#f1f5f9',
    bodyColor: 'rgba(148, 163, 184, 0.9)',
    cornerRadius: 10,
    displayColors: false,
  })

  // Scale defaults
  Chart.defaults.set('scale.grid', {
    color: 'rgba(255, 255, 255, 0.04)',
    tickColor: 'transparent',
  })
  Chart.defaults.set('scale.ticks', {
    color: 'rgba(100, 116, 139, 0.8)',
    padding: 8,
  })
  Chart.defaults.set('scale.border', { display: false })

  // Elements
  Chart.defaults.set('elements.line', { tension: 0.4, borderWidth: 2 })
  Chart.defaults.set('elements.point', { radius: 0, hoverRadius: 5, hoverBorderWidth: 2 })
}
