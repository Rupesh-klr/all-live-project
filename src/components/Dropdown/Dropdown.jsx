import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * Dropdown — select component with label, options array [{value, label, icon}]
 * Props: value, onChange, options, label, placeholder, error, disabled
 */
export function Dropdown({ value, onChange, options = [], label, placeholder = 'Select...', error, disabled = false, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={ref}>
      {label && (
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`input flex items-center justify-between text-left ${error ? 'border-red-500' : ''}`}
      >
        <span className={selected ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''} text-[var(--text-muted)]`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full card shadow-xl overflow-hidden animate-fade-in" style={{ top: '100%' }}>
          <ul className="max-h-52 overflow-y-auto py-1">
            {options.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2
                             hover:bg-brand-500/10 text-[var(--text)] transition-colors"
                >
                  {opt.icon && <opt.icon size={14} className="text-[var(--text-muted)]" />}
                  <span className="flex-1">{opt.label}</span>
                  {value === opt.value && <Check size={12} className="text-brand-500" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
