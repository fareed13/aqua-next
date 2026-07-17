'use client'

import { useState, useMemo } from 'react'
import { HighchartsChart } from '@/components/HighchartsChart'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props { analytics?: Record<string, any>; date_range?: string }

/** Nuxt UserAreaChart — category bar of users-by-area (% dataLabels), 5/page. */
export function UserAreaChart({ analytics }: Props) {
  const [page, setPage] = useState(1)
  const perPage = 5

  const points = useMemo(() => {
    const areas = analytics?.areas ?? []
    return areas.map((a: any) => ({ name: a.city_name, y: a.percentage, val: a.count }))
  }, [analytics])

  const totalPages = Math.ceil(points.length / perPage) || 1
  const start = (page - 1) * perPage
  const end = Math.min(page * perPage, points.length)

  const options = useMemo(() => ({
    chart: { type: 'bar' },
    title: { text: points.length ? 'Users by Area' : 'No Areas found' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: { type: 'category' },
    plotOptions: { series: { borderWidth: 0, pointWidth: 20, dataLabels: { enabled: true, format: '{point.y:,.2f}%' } } },
    tooltip: { pointFormat: '<b>{point.y:.2f}%</b> ({point.val} users)' },
    series: points.length ? [{ name: 'Users', data: points.slice(start, end) }] : [],
  } as any), [points, start, end])

  return (
    <div className="rounded bg-white p-4 shadow">
      <HighchartsChart options={options} style={{ background: 'transparent' }} />
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-500">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="disabled:opacity-40"><ChevronLeft size={18} /></button>
          <span>{start + 1} – {end} / {points.length}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="disabled:opacity-40"><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  )
}
