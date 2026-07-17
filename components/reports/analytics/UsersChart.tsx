'use client'

import { useMemo } from 'react'
import { HighchartsChart } from '@/components/HighchartsChart'

interface Props { analytics?: Record<string, any>; date_range?: string }

const pct = (n: number, d: number) => (d ? `${(Math.round((n / d) * 1000) / 10).toFixed(1)}%` : '0%')

/** Nuxt UsersChart — 5 KPI tiles + a users spline. */
export function UsersChart({ analytics }: Props) {
  const totalUsers = analytics?.total_users ?? 0
  const totalLeads = analytics?.total_leads ?? 0
  const totalPurchases = analytics?.total_purchases ?? 0
  const returning = analytics?.returning_users ?? 0
  const newUsers = totalUsers - returning

  const options = useMemo(() => {
    const series = analytics?.users_series ?? {}
    const categories = Object.keys(series)
    const values = categories.map((k) => series[k])
    const has = categories.length > 0
    return {
      chart: { type: 'spline' },
      title: { text: has ? '' : 'No Users found' },
      credits: { enabled: false },
      xAxis: { categories },
      yAxis: { title: { text: 'Users' } },
      series: has ? [{ name: 'Users', data: values }] : [],
    }
  }, [analytics])

  const tile = (label: string, value: React.ReactNode, sub?: string) => (
    <div className="text-center">
      <h5 className="text-sm font-bold text-[#005695]">{label}</h5>
      <h4 className="text-xl font-bold">{value}</h4>
      {sub && <span className="text-xs font-semibold text-[#188038]">{sub}</span>}
    </div>
  )

  return (
    <div className="rounded bg-white p-4 shadow">
      <div className="mb-2 flex flex-wrap justify-around gap-4">
        {tile('Users', totalUsers)}
        {tile('Conversions', totalLeads, pct(totalLeads, totalUsers))}
        {tile('Trials', totalPurchases, pct(totalPurchases, totalUsers))}
        {tile('Returning Users', returning, pct(returning, totalUsers))}
        {tile('New Users', newUsers, pct(newUsers, totalUsers))}
      </div>
      <HighchartsChart options={options} style={{ background: 'transparent' }} />
    </div>
  )
}
