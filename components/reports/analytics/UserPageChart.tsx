'use client'

import { useState, useMemo } from 'react'
import { HighchartsChart } from '@/components/HighchartsChart'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props { analytics?: Record<string, any>; date_range?: string }

/** Nuxt UserPageChart — bar of users-by-page, 8/page. */
export function UserPageChart({ analytics }: Props) {
  const [page, setPage] = useState(1)
  const perPage = 8

  const { names, counts } = useMemo(() => {
    const pages = analytics?.pages ?? []
    return {
      names: pages.map((p: any) => p.page_name),
      counts: pages.map((p: any) => p.count),
    }
  }, [analytics])

  const totalPages = Math.ceil(counts.length / perPage) || 1
  const start = (page - 1) * perPage
  const end = Math.min(page * perPage, counts.length)

  const options = useMemo(() => ({
    chart: { type: 'bar' },
    title: { text: counts.length ? 'Users by Page' : 'No Pages found' },
    credits: { enabled: false },
    xAxis: { categories: names.slice(start, end) },
    plotOptions: { series: { borderWidth: 0, pointWidth: 20 } },
    series: counts.length ? [{ name: 'Users', data: counts.slice(start, end) }] : [],
  }), [names, counts, start, end])

  return (
    <div className="rounded bg-white p-4 shadow">
      <HighchartsChart options={options} style={{ background: 'transparent' }} />
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-500">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="disabled:opacity-40"><ChevronLeft size={18} /></button>
          <span>{start + 1} – {end} / {counts.length}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="disabled:opacity-40"><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  )
}
