'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { HighchartsChart } from '@/components/HighchartsChart'

interface Data {
  total_customers?: number
  new_customers?: number
  last_four_months?: { month: string; customers: number; purchases: number }[]
}

/** Nuxt UserCharts — Total/New users tiles + a Customers vs Purchases spline. */
export function UserCharts() {
  const { getSecure } = useSecureCalls()
  const [data, setData] = useState<Data>({})
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSecure<Data>(SECURE_ENDPOINTS.ABBI_LEADS_REPORT, {})
      setData(res ?? {})
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [getSecure])
  useEffect(() => { fetchData() }, [fetchData])

  const options = useMemo(() => {
    const months = data.last_four_months ?? []
    return {
      chart: { type: 'spline', backgroundColor: '#fff', height: 260 },
      title: { text: '' },
      credits: { enabled: false },
      xAxis: { title: { text: 'Months' }, categories: months.map(m => m.month) },
      yAxis: { title: { text: 'Incommings' } },
      series: [
        { name: 'Customers', data: months.map(m => m.customers) },
        { name: 'Purchases', data: months.map(m => m.purchases) },
      ],
      responsive: { rules: [{ condition: { maxWidth: 500 }, chartOptions: { legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' } } }] },
    } as any
  }, [data])

  return (
    <div className="flex h-full flex-col rounded bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex gap-6">
          <div><div className="text-xs text-gray-500">Total Users</div><div className="text-lg font-semibold">{data.total_customers ?? 0}</div></div>
          <div><div className="text-xs text-gray-500">New Users</div><div className="text-lg font-semibold">{data.new_customers ?? 0}</div></div>
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
