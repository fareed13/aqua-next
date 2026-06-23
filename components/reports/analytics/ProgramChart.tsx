'use client'

import { useState, useMemo } from 'react'
import { HighchartsChart } from '@/components/HighchartsChart'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  analytics?: Record<string, any>
  date_range?: string
}

export function ProgramChart({ analytics }: Props) {
  const [page, setPage] = useState(1)
  const perPage = 8

  const { data, catgList } = useMemo(() => {
    const programs = analytics?.programs ?? []
    const data: number[] = []
    const catgList: string[] = []
    programs.forEach(({ program_name, count }: any) => {
      catgList.push(program_name)
      data.push(count)
    })
    return { data, catgList }
  }, [analytics])

  const totalPages = Math.ceil(data.length / perPage) || 1
  const start = (page - 1) * perPage
  const end = Math.min(page * perPage, data.length)

  const chartOptions = useMemo(() => ({
    chart: { type: 'bar' },
    title: { text: data.length ? 'Programs' : 'No Programs found' },
    xAxis: { categories: catgList.slice(start, end) },
    plotOptions: { series: { borderWidth: 0, pointWidth: 20, allowPointSelect: true } },
    series: data.length ? [{ name: 'Programs', data: data.slice(start, end) }] : [],
  }), [data, catgList, start, end])

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-[#005695] font-bold text-sm mb-2">Users by Programs:</div>
      <HighchartsChart options={chartOptions} style={{ background: 'transparent' }} />
      {data.length > 0 && (
        <div className="flex justify-end items-center gap-2 mt-2">
          <span className="text-sm text-gray-500">
            <span className="text-[#005695]">{start + 1} – {end}</span> / {data.length}
          </span>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
