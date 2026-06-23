// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { formatDate } from '@/lib/utils/dateTime'
import { HighchartsChart } from '@/components/HighchartsChart'
import { Calendar } from 'lucide-react'

export function LastFifteenDay() {
  const router = useRouter()
  const { getSecure, secureEndpoint } = useSecureCalls()

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const filtered = useMemo(() => {
    if (!search) return chartData
    const s = search.toLowerCase()
    return chartData.filter(d =>
      String(d.date ?? '').toLowerCase().includes(s)
    )
  }, [chartData, search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const pageItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const chartOptions = useMemo(() => ({
    chart: { type: 'spline', backgroundColor: '#fff' },
    title: { text: '' },
    yAxis: { title: { text: 'Attendance' } },
    xAxis: { title: { text: 'Date' }, categories: chartData.map(d => d.date) },
    series: [{ name: 'Check ins', data: chartData.map(d => d.attendants) }],
  }), [chartData])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await getSecure(secureEndpoint.LAST_FIFTEEN_DAY_REPORT)
      setChartData(Array.isArray(res) ? res : [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div>
      <div className="bg-[#124e66] p-6 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="text-white" size={32} />
          <div>
            <h1 className="text-xl font-semibold text-white mb-0">Last 15 Days Report</h1>
            <p className="text-sm text-white/70 mb-0">Attendance over the past 15 days</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="border rounded px-3 py-2 text-sm w-full sm:w-72"
        />
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded shadow p-4 mb-4">
          <HighchartsChart options={chartOptions} style={{ background: 'transparent' }} />
        </div>
      )}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Date', 'Check ins'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="text-center py-8 text-gray-400">Loading…</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={2} className="text-center py-8 text-gray-400">No results</td></tr>
            ) : pageItems.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{d.date ? formatDate(d.date, 'DD MMM YYYY') : ''}</td>
                <td className="px-4 py-3">{d.attendants}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center px-4 py-3 border-t text-sm">
          <span className="text-gray-500">{filtered.length} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-30">Prev</button>
            <span className="px-3 py-1">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
