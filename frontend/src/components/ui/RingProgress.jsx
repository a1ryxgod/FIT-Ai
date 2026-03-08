/**
 * Кольцевой прогресс (как в MyFitnessPal)
 * SVG-based, анимированный через CSS transition
 */
export default function RingProgress({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = 'brand',
  label = null,
  sublabel = null,
  showPercent = false,
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(value / (max || 1), 1)
  const offset = circumference * (1 - pct)

  const strokeColors = {
    brand:   'url(#brandGrad)',
    green:   '#22C55E',
    amber:   '#F59E0B',
    blue:    '#3B82F6',
    red:     '#EF4444',
    purple:  'url(#brandGrad)',
  }

  const displayColor = strokeColors[color] ?? strokeColors.brand

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(88,72,210)" />
              <stop offset="100%" stopColor="rgb(145,128,245)" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={displayColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        {/* Center content */}
        {(label !== null) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ transform: 'rotate(0deg)' }}
          >
            <span className="text-white font-bold" style={{ fontSize: size * 0.18 }}>
              {showPercent ? `${Math.round(pct * 100)}%` : label}
            </span>
            {sublabel && (
              <span className="text-slate-500" style={{ fontSize: size * 0.1 }}>
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Маленькое кольцо для макро (protein/carbs/fats) */
export function MiniRing({ value = 0, max = 100, color = 'brand', label, unit = 'г' }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <RingProgress value={value} max={max} size={64} strokeWidth={6} color={color} label={value} sublabel={unit} />
      {label && <span className="text-caption text-slate-500">{label}</span>}
    </div>
  )
}
