'use client'

import { useState, useMemo, useEffect } from 'react'
import { HighchartsChart } from '@/components/HighchartsChart'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props { analytics?: Record<string, any>; date_range?: string }
interface Campaign { leads: number; purchases: number; utm_campaign: string }

/** Nuxt LeadAndPurchaseChart — source tabs + dual-axis (leads / purchases) column, 5/page. */
export function LeadAndPurchaseChart({ analytics }: Props) {
  const sources: string[] = useMemo(() => analytics?.utm_sources ?? [], [analytics])
  const campaignsBySource: Record<string, Campaign[]> = analytics?.utm_campaigns ?? {}

  const [activeSource, setActiveSource] = useState<string>('')
  const [page, setPage] = useState(1)
  const perPage = 5

  useEffect(() => { setActiveSource(sources[0] ?? ''); setPage(1) }, [sources])

  const campaigns = campaignsBySource[activeSource] ?? []
  const totalPages = Math.ceil(campaigns.length / perPage) || 1
  const start = (page - 1) * perPage
  const end = Math.min(page * perPage, campaigns.length)
  const slice = campaigns.slice(start, end)

  const options = useMemo(() => ({
    chart: { type: 'column' },
    title: { text: sources.length ? '' : 'No Leads and Purchases found' },
    credits: { enabled: false },
    xAxis: { categories: slice.map((c) => c.utm_campaign) },
    yAxis: [
      { title: { text: 'Leads' } },
      { title: { text: 'Purchases' }, opposite: true, labels: { format: '{value}$' } },
    ],
    series: campaigns.length
      ? [
          { name: 'Leads', data: slice.map((c) => c.leads), yAxis: 0 },
          { name: 'Purchases', data: slice.map((c) => c.purchases), yAxis: 1, tooltip: { valueSuffix: '$' } },
        ]
      : [],
  } as any), [sources, campaigns, slice])

  return (
    <div className="rounded bg-white p-4 shadow">
      {sources.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 border-b">
          {sources.map((s) => (
            <button key={s} onClick={() => { setActiveSource(s); setPage(1) }}
              className={`px-3 py-2 text-sm font-medium ${activeSource === s ? 'border-b-2 border-[#124e66] text-[#124e66]' : 'text-gray-500'}`}>
              {s}
            </button>
          ))}
        </div>
      )}
      {activeSource && campaigns.length === 0
        ? <p className="py-8 text-center text-gray-400">No Campaigns found</p>
        : <HighchartsChart options={options} style={{ background: 'transparent' }} />}
      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3 text-sm text-gray-500">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="disabled:opacity-40"><ChevronLeft size={18} /></button>
          <span>{start + 1} – {end} / {campaigns.length}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="disabled:opacity-40"><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  )
}
