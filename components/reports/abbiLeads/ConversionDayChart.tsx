'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { HighchartsChart } from '@/components/HighchartsChart'

const MAP_DAYS: Record<string, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

export function ConversionDayChart() {
  const { getSecure } = useSecureCalls()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{ name: string; y: number }[]>([])

  const getAnalyticsConversion = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getSecure<Record<string, string>[]>(SECURE_ENDPOINTS.LEADS_CONVERSION_DAY, {})
      const points = (response || []).map(v => {
        const key = Object.keys(v)[0]
        return { name: MAP_DAYS[key], y: parseFloat(v[key]) }
      })
      setData(points)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [getSecure])

  useEffect(() => { getAnalyticsConversion() }, [])

  const chartOptions = {
    chart: { type: 'pie', backgroundColor: '#fff' },
    title: false,
    credits: { enabled: false },
    series: [{ name: 'days', allowPointSelect: true, data, showInLegend: true }],
  } as any

  return (
    <div className="bg-white rounded shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 font-medium">
        Conversion by Day
        <button
          type="button"
          onClick={getAnalyticsConversion}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <hr className="border-gray-100" />
      <HighchartsChart options={chartOptions} style={{ background: 'transparent' }} />
    </div>
  )
}
