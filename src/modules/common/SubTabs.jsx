/**
 * SubTabs — horizontal sub-navigation bar used inside dashboard layouts.
 * Each tab gets an optional badge count and a colored active underline.
 */
export function SubTabs({ tabs, active, onSelect, color = '#3b82f6' }) {
  return (
    <div className="flex border-b border-[var(--border)] mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {tabs.map(tab => {
        const Icon  = tab.icon
        const isAct = active === tab.id
        const accent = tab.color || color
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap
                        border-b-2 transition-colors shrink-0 ${
              isAct
                ? 'border-current'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            style={isAct ? { color: accent, borderBottomColor: accent } : {}}
          >
            {Icon && <Icon size={13} />}
            {tab.label}
            {tab.badge != null && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono
                               bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-muted)]">
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
