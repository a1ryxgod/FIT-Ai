export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export const round1 = (n) => Math.round((n ?? 0) * 10) / 10

export const macroPercent = (totals) => {
  const { calories = 0, protein = 0, fats = 0, carbs = 0 } = totals ?? {}
  const calsFromProtein = protein * 4
  const calsFromFats = fats * 9
  const calsFromCarbs = carbs * 4
  const total = calsFromProtein + calsFromFats + calsFromCarbs || 1
  return {
    protein: Math.round((calsFromProtein / total) * 100),
    fats: Math.round((calsFromFats / total) * 100),
    carbs: Math.round((calsFromCarbs / total) * 100),
  }
}

export const groupByDate = (items, dateKey = 'date') => {
  return items.reduce((acc, item) => {
    const date = item[dateKey]
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})
}

export const extractError = (err) => {
  const data = err?.response?.data
  if (!data) return 'Unknown error'
  if (typeof data === 'string') return data
  return data.error ?? data.detail ?? Object.values(data).flat().join(', ')
}
