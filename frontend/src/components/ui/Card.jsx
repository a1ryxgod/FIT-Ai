import { clsx } from 'clsx'

export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      className={clsx(
        'card animate-fade-in',
        onClick && 'cursor-pointer hover:border-primary-500/50 transition-colors',
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
        <h3 className="font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, unit, color = 'primary', icon }) {
  const colors = {
    primary: 'text-primary-400',
    green: 'text-emerald-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }
  return (
    <Card className="text-center">
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <p className={clsx('text-2xl font-bold', colors[color])}>
        {value}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </Card>
  )
}
