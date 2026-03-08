/**
 * SearchInput — Input с иконкой поиска и кнопкой очистки
 * Поддерживает debounce через пропс onChange
 */
import { useRef } from 'react'
import { clsx } from 'clsx'
import { Search, X } from '../../utils/icons'

export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Пошук...',
  className = '',
  autoFocus = false,
  ...props
}) {
  const inputRef = useRef(null)

  const handleClear = () => {
    onChange?.('')
    inputRef.current?.focus()
  }

  return (
    <div className={clsx('relative', className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        <Search className="h-4 w-4" />
      </div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="input pl-10 pr-10 w-full"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
