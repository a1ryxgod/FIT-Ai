import { clsx } from 'clsx'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500',
  secondary: 'bg-surface-700 hover:bg-surface-600 text-slate-100 focus:ring-surface-500',
  ghost: 'hover:bg-surface-700 text-slate-300 hover:text-slate-100 focus:ring-surface-500',
  danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
