import { clsx } from 'clsx'

const colors = {
  owner:   'bg-brand-500/20 text-brand-300 border border-brand-500/30',
  admin:   'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  trainer: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  member:  'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  active:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  inactive:'bg-red-500/20 text-red-300 border border-red-500/30',
  default: 'bg-surface-700 text-slate-300 border border-surface-600',
}

const dotColors = {
  active:   'bg-emerald-400',
  inactive: 'bg-red-400',
  brand:    'bg-brand-400',
  default:  'bg-slate-400',
}

export default function Badge({ children, color = 'default', className = '', icon: Icon = null, dot = false }) {
  return (
    <span className={clsx('badge', colors[color] ?? colors.default, className)}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[color] ?? dotColors.default)} />
      )}
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {children}
    </span>
  )
}
