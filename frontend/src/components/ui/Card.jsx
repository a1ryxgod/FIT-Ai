import { clsx } from 'clsx'

export default function Card({ children, className = '', onClick, glass = false, ...props }) {
  return (
    <div
      className={clsx(
        glass ? 'card-glass' : 'card',
        onClick && 'card-interactive',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-slate-100 text-small">{title}</h3>
        {subtitle && <p className="text-caption text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, unit, color = 'brand', icon }) {
  const colors = {
    brand:  'text-brand-400',
    green:  'text-emerald-400',
    orange: 'text-amber-400',
    red:    'text-danger',
    blue:   'text-blue-400',
  }
  return (
    <Card className="text-center">
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <p className={clsx('text-2xl font-bold', colors[color])}>
        {value}
        {unit && <span className="text-small font-normal text-slate-500 ml-1">{unit}</span>}
      </p>
      <p className="text-caption text-slate-500 mt-1">{label}</p>
    </Card>
  )
}
