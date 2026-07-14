'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  length: number
  onChange: (page: number) => void
  totalVisible?: number
}

/** Small pagination control mirroring v-pagination (prev / numbered pages / next). */
export function DashPagination({ page, length, onChange, totalVisible = 5 }: Props) {
  if (length <= 1) return null

  const half = Math.floor(totalVisible / 2)
  let start = Math.max(1, page - half)
  const end = Math.min(length, start + totalVisible - 1)
  start = Math.max(1, end - totalVisible + 1)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const btnBase = 'w-8 h-8 flex items-center justify-center rounded text-sm transition-colors'

  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}
        className={`${btnBase} text-gray-600 disabled:opacity-30 hover:bg-gray-100`} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} type="button" onClick={() => onChange(p)}
          className={`${btnBase} ${p === page ? 'bg-blue-600 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
          {p}
        </button>
      ))}
      <button type="button" disabled={page >= length} onClick={() => onChange(page + 1)}
        className={`${btnBase} text-gray-600 disabled:opacity-30 hover:bg-gray-100`} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
