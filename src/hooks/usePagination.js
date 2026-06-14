import { useState, useMemo } from 'react'

/**
 * Client-side pagination hook — reusable by any module that has an in-memory list.
 *
 *   const { page, totalPages, pageItems, setPage, next, prev, total, pageSize } =
 *     usePagination(rows, 5)
 *
 * Pass the resulting `pageItems` to <Table>, and wire <Pagination> to `page`/`setPage`.
 * For server-driven pagination, ignore this and drive <Pagination> from API meta instead.
 */
export function usePagination(items = [], pageSize = 8) {
  const [page, setPage] = useState(1)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  )

  return {
    page: safePage,
    totalPages,
    pageItems,
    total,
    pageSize,
    setPage,
    next: () => setPage(p => Math.min(p + 1, totalPages)),
    prev: () => setPage(p => Math.max(p - 1, 1)),
  }
}
