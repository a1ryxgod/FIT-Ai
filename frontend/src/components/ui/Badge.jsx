import { clsx } from 'clsx'

const colors = {
  owner: 'bg-primary-500/20 text-primary-300 border border-primary-500/30',
  admin: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  trainer: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  member: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  active: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  inactive: 'bg-red-500/20 text-red-300 border border-red-500/30',
  default: 'bg-surface-700 text-slate-300 border border-surface-600',
}

export default function Badge({ children, color = 'default', className = '' }) {
  return (
    <span className={clsx('badge', colors[color] ?? colors.default, className)}>
      {children}
    </span>
  )
}
