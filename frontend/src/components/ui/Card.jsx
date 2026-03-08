import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { slideUp } from '../../utils/animations'

export default function Card({ children, className = '', onClick, glass = false, animate = false, ...props }) {
  const cls = clsx(
    glass ? 'card-glass' : 'card',
    onClick && 'card-interactive',
    className
  )

  if (animate) {
    return (
      <motion.div
        className={cls}
        onClick={onClick}
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={slideUp.transition}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={cls} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon = null }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="icon-container-sm">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-100 text-small">{title}</h3>
          {subtitle && <p className="text-caption text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, unit, color = 'brand', icon: Icon = null }) {
  const colorMap = {
    brand:  { text: 'text-brand-400',   bg: 'bg-brand-500/10' },
    green:  { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    orange: { text: 'text-amber-400',   bg: 'bg-amber-500/10' },
    red:    { text: 'text-danger',       bg: 'bg-red-500/10' },
    blue:   { text: 'text-blue-400',    bg: 'bg-blue-500/10' },
  }
  const c = colorMap[color] ?? colorMap.brand

  return (
    <Card className="text-center">
      {Icon && (
        <div className={clsx('inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2', c.bg)}>
          <Icon className={clsx('h-5 w-5', c.text)} />
        </div>
      )}
      <p className={clsx('text-2xl font-bold', c.text)}>
        {value}
        {unit && <span className="text-small font-normal text-slate-500 ml-1">{unit}</span>}
      </p>
      <p className="text-caption text-slate-500 mt-1">{label}</p>
    </Card>
  )
}
