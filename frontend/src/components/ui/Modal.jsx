import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '../../utils/icons'
import { backdropVariants, modalVariants } from '../../utils/animations'

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer = null }) {
  const maxWidths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.()
    if (isOpen) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
          <motion.div
            className={`relative w-full ${maxWidths[size]} bg-surface-800 border border-surface-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/60 flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            )}
            <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="px-6 py-4 border-t border-surface-700/60 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
