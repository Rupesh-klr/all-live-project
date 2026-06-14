/**
 * Table component
 * columns: [{ key, label, render?: (row) => ReactNode, width?, align? }]
 * rows: array of objects
 * Props: columns, rows, loading, emptyMessage, onRowClick
 */
export function Table({ columns = [], rows = [], loading = false, emptyMessage = 'No data.', onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--bg-2)] border-b border-[var(--border)]">
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest
                            text-[var(--text-muted)] ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--text-muted)]">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  Loading…
                </div>
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--text-muted)] font-mono text-xs">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading && rows.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-[var(--border)] transition-colors
                         ${onRowClick ? 'cursor-pointer hover:bg-brand-500/5' : ''}`}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-[var(--text)] ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
