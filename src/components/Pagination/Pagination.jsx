import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Pagination — reusable pager. Works with either the usePagination hook
 * (client-side) or API pagination meta (server-side).
 *
 * Props:
 *   page        current page (1-based)
 *   totalPages  total number of pages
 *   total       total item count (optional — enables the "x–y of z" label)
 *   pageSize    items per page (optional — used for the label)
 *   onPage(n)   called with the requested page number
 *   loading     disables controls while a request is in flight
 */
export function Pagination({ page, totalPages, total, pageSize, onPage, loading = false }) {
  if (totalPages <= 1) return null

  // Compact window of page numbers around the current page
  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const from = total != null && pageSize != null ? (page - 1) * pageSize + 1 : null
  const to = total != null && pageSize != null ? Math.min(page * pageSize, total) : null

  const go = (n) => { if (!loading && n >= 1 && n <= totalPages && n !== page) onPage(n) }

  return (
    <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
      {from != null ? (
        <p className="text-[11px] font-mono text-[var(--text-muted)]">
          {from}–{to} of {total}
        </p>
      ) : <span />}

      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={loading || page <= 1}
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                     hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {start > 1 && (
          <>
            <PageBtn n={1} page={page} onClick={go} />
            {start > 2 && <span className="px-1 text-[var(--text-muted)] text-xs">…</span>}
          </>
        )}

        {pages.map(n => <PageBtn key={n} n={n} page={page} onClick={go} />)}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-[var(--text-muted)] text-xs">…</span>}
            <PageBtn n={totalPages} page={page} onClick={go} />
          </>
        )}

        <button
          onClick={() => go(page + 1)}
          disabled={loading || page >= totalPages}
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]
                     hover:text-[var(--text)] hover:bg-[var(--bg-2)] transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function PageBtn({ n, page, onClick }) {
  const active = n === page
  return (
    <button
      onClick={() => onClick(n)}
      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-mono transition-colors border
                  ${active
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)]'}`}
    >
      {n}
    </button>
  )
}
