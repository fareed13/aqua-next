'use client'

import { useMemo } from 'react'
import { HighchartsChart } from '@/components/HighchartsChart'

interface Props { analytics?: Record<string, any>; date_range?: string }

/** Nuxt TrialChart — Total Trials tile + a purchases spline. */
export function TrialChart({ analytics }: Props) {
  const totalPurchases = analytics?.total_purchases ?? 0

  const options = useMemo(() => {
    const series = analytics?.purchases_series ?? {}
    const categories = Object.keys(series)
    const values = categories.map((k) => series[k])
    const has = categories.length > 0
    return {
      chart: { type: 'spline' },
      title: { text: has ? '' : 'No Trials found' },
      credits: { enabled: false },
      xAxis: { categories },
      yAxis: { title: { text: 'Trials' } },
      series: has ? [{ name: 'Trials', data: values }] : [],
    }
  }, [analytics])

  return (
    <div className="rounded bg-white p-4 shadow">
      <div className="mb-2 text-center">
        <h5 className="text-sm font-bold text-[#005695]">Total Trials</h5>
        <h4 className="text-xl font-bold">{totalPurchases}</h4>
      </div>
      <HighchartsChart options={options} style={{ background: 'transparent' }} />
    </div>
  )
}
