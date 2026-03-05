import Button from './Button'

export default function EmptyState({ icon = '📭', title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>}
      {action && onAction && (
        <Button onClick={onAction}>{action}</Button>
      )}
    </div>
  )
}
