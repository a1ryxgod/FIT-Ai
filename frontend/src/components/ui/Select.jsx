/**
 * Кастомный styled Select (замена нативного <select>)
 */
import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { ChevronDown, Check } from '../../utils/icons'
import { motion, AnimatePresence } from 'framer-motion'

export default function Select({
  label,
  value,
  onChange,
  options = [], // [{ value, label }]
  placeholder = 'Оберіть...',
  icon: Icon,
  error,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (optValue) => {
    onChange?.(optValue)
    setOpen(false)
  }

  return (
    <div className={clsx('w-full', className)} ref={ref}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={clsx(
            'input w-full text-left flex items-center justify-between',
            error && 'border-red-500',
            !selected && 'text-slate-600'
          )}
        >
          <span className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-slate-500 shrink-0" />}
            <span className={selected ? 'text-slate-100' : 'text-slate-500'}>
              {selected?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown
            className={clsx('h-4 w-4 text-slate-500 transition-transform duration-200', open && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 card-glass rounded-xl overflow-hidden"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={clsx(
                    'w-full text-left px-4 py-3 text-small flex items-center justify-between transition-colors',
                    opt.value === value
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-slate-300 hover:bg-white/5'
                  )}
                >
                  {opt.label}
                  {opt.value === value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
