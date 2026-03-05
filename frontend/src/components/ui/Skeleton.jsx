import { clsx } from 'clsx'

export default function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={clsx('skeleton', className)}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard({ rows = 2 }) {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={clsx('h-4', i % 2 === 0 ? 'w-full' : 'w-3/4')} />
      ))}
    </div>
  )
}

export function SkeletonStatRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card flex flex-col items-center gap-2 py-2">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={1} />
      ))}
    </div>
  )
}
