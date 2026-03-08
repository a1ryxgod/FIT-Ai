import { motion } from 'framer-motion'
import Button from './Button'
import { fadeIn } from '../../utils/animations'

export default function EmptyState({ title, description, action, onAction, icon: Icon = null }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      {...fadeIn}
    >
      {Icon ? (
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-5">
          <Icon className="h-8 w-8 text-brand-400/70" />
        </div>
      ) : (
        <div className="w-12 h-0.5 bg-surface-600 rounded-full mb-6" />
      )}
      <h3 className="text-small font-semibold text-slate-400 mb-1">{title}</h3>
      {description && <p className="text-caption text-slate-600 mb-6 max-w-xs">{description}</p>}
      {action && onAction && (
        <Button onClick={onAction} size="sm">{action}</Button>
      )}
    </motion.div>
  )
}
