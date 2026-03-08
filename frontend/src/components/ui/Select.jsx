/**
 * Кастомный styled Select (замена нативного <select>)
 * Dropdown рендерится через portal чтобы не обрезаться overflow:hidden родителей
 */
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownStyle, setDropdownStyle] = useState({})
  const triggerRef = useRef(null)
  const ref = useRef(null)

  const selected = options.find(o => o.value === value)

  // Close on outside click or scroll
  useEffect(() => {
    const handleClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        !document.getElementById('select-portal')?.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    const handleScroll = () => setOpen(false)

    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  // Position dropdown relative to trigger button
  const handleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const dropUp = spaceBelow < 220 && spaceAbove > spaceBelow

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(dropUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      })
    }
    setOpen(v => !v)
  }

  const handleSelect = (optValue) => {
    onChange?.(optValue)
    setOpen(false)
  }

  return (
    <div className={clsx('w-full', className)} ref={ref}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          className={clsx(
            'input w-full text-left flex items-center justify-between',
            error && 'border-red-500',
          )}
        >
          <span className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-slate-500 shrink-0" />}
            <span className={selected ? 'text-slate-100' : 'text-slate-500'}>
              {selected?.label ?? placeholder}
            </span>
          </span>
          <ChevronDown
            className={clsx('h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0', open && 'rotate-180')}
          />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              id="select-portal"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                ...dropdownStyle,
                background: 'rgba(20,20,22,0.97)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                maxHeight: '240px',
                overflowY: 'auto',
              }}
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
                  {opt.value === value && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
