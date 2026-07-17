'use client'

import type { ReactNode } from 'react'

/**
 * Mobile card row used by the customer detail tabs (< md), mirroring Nuxt's
 * `v-data-iterator` cards: a header line (main field + optional action) followed
 * by icon+value detail rows. The desktop tables stay as-is behind `hidden md:block`.
 */
export function MobileCard({
  header,
  action,
  rows,
}: {
  header: ReactNode
  action?: ReactNode
  rows: { icon?: ReactNode; value: ReactNode }[]
}) {
  return (
    <div className="rounded border border-gray-200 bg-white p-3 text-sm shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">{header}</div>
        {action}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-1.5 py-0.5 text-gray-700">
          {r.icon && <span className="shrink-0 text-[#6D6D6D]">{r.icon}</span>}
          <span className="min-w-0 break-words">{r.value}</span>
        </div>
      ))}
    </div>
  )
}
