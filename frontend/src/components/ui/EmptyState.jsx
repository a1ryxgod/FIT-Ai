import { motion } from 'framer-motion'
import Button from './Button'
import { slideUp } from '../../utils/animations'

export default function EmptyState({ title, description, action, onAction, icon: Icon = null }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center w-full rounded-3xl border border-white/[0.04] bg-surface-900/40 backdrop-blur-md relative overflow-hidden"
      {...slideUp}
    >
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-500/10 blur-[60px] rounded-full pointer-events-none" />

      {Icon ? (
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-brand-400/20 blur-xl rounded-full" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-transparent border border-brand-400/20 flex items-center justify-center relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <Icon className="h-8 w-8 text-brand-400 drop-shadow-[0_0_10px_rgba(var(--brand-500),0.8)]" />
          </div>
        </div>
      ) : (
        <div className="w-12 h-0.5 bg-surface-600 rounded-full mb-6 relative z-10" />
      )}
      <h3 className="text-h3 font-heading text-white mb-2 relative z-10 tracking-tight">{title}</h3>
      {description && <p className="text-small text-slate-400 mb-8 max-w-sm relative z-10 leading-relaxed">{description}</p>}
      {action && onAction && (
        <div className="relative z-10">
          <Button onClick={onAction} className="btn-primary shadow-brand">{action}</Button>
        </div>
      )}
    </motion.div>
  )
}
