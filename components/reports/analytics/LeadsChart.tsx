'use client'

import { useMemo } from 'react'
import { HighchartsChart } from '@/components/HighchartsChart'

interface Props {
  analytics?: Record<string, any>
  date_range?: string
}

export function LeadsChart({ analytics }: Props) {
  const totalLeads = analytics?.total_leads ?? ''
  const leadSeries = analytics?.lead_series ?? {}
  const hasData = Object.keys(leadSeries).length > 0

  const chartOptions = useMemo(() => {
    const categories: string[] = []
    const values: number[] = []
    if (hasData) {
      Object.entries(leadSeries).forEach(([key, value]) => {
        categories.push(key)
        values.push(value as number)
      })
    }
    return {
      chart: { type: 'spline' },
      title: { text: hasData ? 'Leads' : 'No Leads found' },
      xAxis: { categories },
      yAxis: { title: { text: 'Leads' } },
      tooltip: { crosshairs: true, shared: true },
      plotOptions: { spline: { marker: { radius: 4, lineColor: '#666666', lineWidth: 1 } } },
      series: hasData ? [{ name: 'Leads', data: values }] : [],
    }
  }, [analytics])

  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex gap-6 mb-2">
        <div className="text-center cursor-pointer">
          <h5 className="text-sm font-bold text-[#005695]">Total Leads</h5>
          <h4 className="text-xl font-bold">{totalLeads}</h4>
        </div>
      </div>
      <HighchartsChart options={chartOptions} style={{ background: 'transparent' }} />
    </div>
  )
}
