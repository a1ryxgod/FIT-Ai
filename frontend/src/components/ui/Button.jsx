import { clsx } from 'clsx'
import Spinner from './Spinner'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
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
  ...props
}) {
  return (
    <button
      className={clsx(
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
