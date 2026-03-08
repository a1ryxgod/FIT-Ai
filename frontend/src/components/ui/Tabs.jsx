/**
 * Pill-табы с анимированным индикатором активного таба (Framer Motion layoutId)
 */
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  // tabs: [{ id, label, icon?: LucideComponent }]
  return (
    <div className={clsx('flex gap-1 p-1 rounded-xl bg-surface-900/60 border border-surface-700/50', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const Icon = tab.icon ?? null

        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={clsx(
              'relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-small font-medium transition-colors duration-150 flex-1 justify-center',
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-brand-500/20 border border-brand-500/30 rounded-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            {Icon && <Icon className="h-3.5 w-3.5 relative z-10" />}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
