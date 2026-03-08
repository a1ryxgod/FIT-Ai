import { clsx } from 'clsx'
import { Loader2 } from '../../utils/icons'

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <Loader2
      className={clsx('animate-spin text-brand-400', sizes[size], className)}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  )
}
