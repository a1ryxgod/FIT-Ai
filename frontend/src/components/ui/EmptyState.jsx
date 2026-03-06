import Button from './Button'

export default function EmptyState({ title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-0.5 bg-surface-600 rounded-full mb-6" />
      <h3 className="text-small font-semibold text-slate-400 mb-1">{title}</h3>
      {description && <p className="text-caption text-slate-600 mb-6 max-w-xs">{description}</p>}
      {action && onAction && (
        <Button onClick={onAction} size="sm">{action}</Button>
      )}
    </div>
  )
}
