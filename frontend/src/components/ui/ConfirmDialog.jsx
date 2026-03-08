/**
 * Диалог подтверждения для деструктивных действий
 */
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle, Trash2 } from '../../utils/icons'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Підтвердити дію',
  description = 'Ця дія незворотна.',
  confirmLabel = 'Підтвердити',
  cancelLabel = 'Скасувати',
  variant = 'danger', // 'danger' | 'warning'
  loading = false,
}) {
  const Icon = variant === 'danger' ? Trash2 : AlertTriangle
  const iconBg = variant === 'danger' ? 'bg-red-500/10' : 'bg-amber-500/10'
  const iconColor = variant === 'danger' ? 'text-red-400' : 'text-amber-400'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
          <p className="text-small text-slate-400">{description}</p>
        </div>
        <div className="flex gap-3 w-full pt-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
