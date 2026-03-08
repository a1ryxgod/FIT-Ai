/**
 * Обёртка страниц с fade+slide-up анимацией
 */
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/animations'

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  )
}
