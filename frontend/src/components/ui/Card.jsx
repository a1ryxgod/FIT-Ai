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
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="icon-container-sm bg-surface-800/50 border border-white/[0.04] text-slate-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="font-heading font-semibold text-white tracking-tight text-lg">{title}</h3>
          {subtitle && <p className="text-caption text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, unit, color = 'brand', icon: Icon = null }) {
  const colorMap = {
    brand:  { text: 'text-brand-400',   bg: 'bg-brand-500/10 border-brand-500/20' },
    green:  { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    orange: { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
    red:    { text: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
    cyan:   { text: 'text-[#00E5FF]',   bg: 'bg-[#00E5FF]/10 border-[#00E5FF]/20' },
  }
  const c = colorMap[color] ?? colorMap.brand

  return (
    <Card className="text-center group overflow-hidden relative">
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-20 pointer-events-none rounded-full ${colorMap[color]?.bg || ''}`} />
      
      {Icon && (
        <div className={clsx('relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 border', c.bg)}>
          <Icon className={clsx('h-6 w-6', c.text)} />
        </div>
      )}
      <p className={clsx('relative z-10 font-heading font-bold text-3xl tracking-tight mb-1', c.text)}>
        {value}
        {unit && <span className="text-small font-normal text-slate-500 ml-1">{unit}</span>}
      </p>
      <p className="relative z-10 text-[11px] font-medium text-slate-400 uppercase tracking-widest">{label}</p>
    </Card>
  )
}
