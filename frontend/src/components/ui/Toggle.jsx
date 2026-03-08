/**
 * Анимированный toggle switch
 */
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function Toggle({ checked = false, onChange, label, labelLeft, labelRight, disabled = false }) {
  return (
    <div className={clsx('flex items-center gap-3', disabled && 'opacity-50 pointer-events-none')}>
      {labelLeft && (
        <span className={clsx('text-small transition-colors', !checked ? 'text-slate-100 font-medium' : 'text-slate-500')}>
          {labelLeft}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-brand-500' : 'bg-surface-600'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 35 }}
          className="inline-block h-4 w-4 rounded-full bg-white shadow-md"
          style={{ x: checked ? 24 : 4 }}
        />
      </button>
      {labelRight && (
        <span className={clsx('text-small transition-colors', checked ? 'text-slate-100 font-medium' : 'text-slate-500')}>
          {labelRight}
        </span>
      )}
      {label && (
        <span className="text-small text-slate-300">{label}</span>
      )}
    </div>
  )
}
