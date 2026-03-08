import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import { Loader2 } from '../../utils/icons'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  gradient:  'btn-primary bg-brand-gradient hover:opacity-90 shadow-brand',
}

const sizes = {
  sm: 'px-3 text-[13px] !min-h-[34px]',
  md: '',
  lg: 'px-6 text-base !min-h-[52px]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  fullWidth = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={clsx(
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : Icon && <Icon className="h-4 w-4 flex-shrink-0" />
      }
      {children}
      {!loading && IconRight && <IconRight className="h-4 w-4 flex-shrink-0" />}
    </motion.button>
  )
}
