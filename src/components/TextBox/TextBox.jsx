import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * TextBox — controlled input with label, error, hint, password toggle, icon
 * Props: label, error, hint, icon (LucideIcon), type, required, ...rest (input props)
 */
export function TextBox({
  label,
  error,
  hint,
  icon: Icon,
  type = 'text',
  required = false,
  className = '',
  ...rest
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Icon size={14} />
          </span>
        )}
        <input
          type={inputType}
          className={`input ${Icon ? 'pl-9' : ''} ${isPassword ? 'pr-9' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
}
