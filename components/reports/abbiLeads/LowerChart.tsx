'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { HighchartsChart } from '@/components/HighchartsChart'

interface DayResult { totalUsers: number; newUsers: number; userEngagementDuration: number; totalRevenue: number }
interface Data { total_results?: DayResult; per_day_result?: Record<string, DayResult> }

type Metric = 'totalUsers' | 'newUsers' | 'engTime' | 'revenue'

/** Nuxt LowerChart — 4 clickable metric tiles that swap a per-day spline series. */
export function LowerChart() {
  const { getSecure } = useSecureCalls()
  const [data, setData] = useState<Data>({})
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Metric>('totalUsers')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSecure<Data>(SECURE_ENDPOINTS.LEADS_ANALYTICS_USER, {})
      setData(res ?? {})
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [getSecure])
  useEffect(() => { fetchData() }, [fetchData])

  const totals = data.total_results ?? { totalUsers: 0, newUsers: 0, userEngagementDuration: 0, totalRevenue: 0 }
  const engStr = useMemo(() => {
    const tins = totals.totalUsers ? Number(totals.userEngagementDuration) / totals.totalUsers : 0
    return `${Math.floor(tins / 60)}m ${Math.floor(tins % 60)}s`
  }, [totals])

  const perDay = data.per_day_result ?? {}
  const dates = Object.keys(perDay)
  const seriesData = useMemo(() => dates.map((d) => {
    const r = perDay[d]
    switch (selected) {
      case 'totalUsers': return parseInt(String(r.totalUsers)) || 0
      case 'newUsers': return parseInt(String(r.newUsers)) || 0
      case 'engTime': return parseFloat(String(r.userEngagementDuration)) || 0
      case 'revenue': return parseFloat(String(r.totalRevenue)) || 0
    }
  }), [dates, perDay, selected])

  const options = useMemo(() => ({
    chart: { type: 'spline', backgroundColor: '#fff', height: 260 },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: { categories: dates },
    yAxis: { title: { text: '' } },
    series: [{ name: selected, data: seriesData }],
    responsive: { rules: [{ condition: { maxWidth: 500 }, chartOptions: { legend: { enabled: false } } }] },
  } as any), [dates, seriesData, selected])

  const tile = (key: Metric, label: string, value: React.ReactNode) => (
    <button onClick={() => setSelected(key)} className={`rounded px-2 py-1 text-left ${selected === key ? 'text-red-600' : 'text-gray-700'}`}>
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </button>
  )

  return (
    <div className="flex h-full flex-col rounded bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex flex-wrap gap-3">
          {tile('totalUsers', 'Users', totals.totalUsers ?? 0)}
          {tile('newUsers', 'New Users', totals.newUsers ?? 0)}
          {tile('engTime', 'Avg Engagement', engStr)}
          {tile('revenue', 'Total Revenue', `$ ${totals.totalRevenue ?? 0}`)}
        </div>
        <button onClick={fetchData} disabled={loading} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" aria-label="Refresh">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <hr className="border-gray-100" />
      <div className="flex-1"><HighchartsChart options={options} style={{ background: 'transparent' }} /></div>
    </div>
  )
}
