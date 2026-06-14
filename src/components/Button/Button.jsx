import { Loader2 } from 'lucide-react'

/**
 * Button component
 * Props: variant (primary|ghost|danger|outline), size (sm|md|lg),
 *        loading, disabled, icon (LucideIcon), iconPos (left|right), fullWidth
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPos = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20',
    ghost:   'bg-transparent border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)]',
    danger:  'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-brand-500 text-brand-500 hover:bg-brand-500/10',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-2.5',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {!loading && Icon && iconPos === 'left' && <Icon size={14} />}
      {children}
      {!loading && Icon && iconPos === 'right' && <Icon size={14} />}
    </button>
  )
}
