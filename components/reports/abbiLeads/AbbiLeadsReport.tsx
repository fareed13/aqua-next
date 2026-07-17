'use client'

import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { addMonths, startOfMonth, endOfMonth, formatDate } from '@/lib/utils/dateTime'
import { GroupingTable } from './GroupingTable'
import { PageDetailTable } from './PageDetailTable'
import { UserCharts } from './UserCharts'
import { LowerChart } from './LowerChart'
import { ConversionDayChart } from './ConversionDayChart'
import { ConversionDeviceChart } from './ConversionDeviceChart'

/** Nuxt AbbiLeadsReport — container: header + a 3-col grid of report cards (last-month data). */
export function AbbiLeadsReport() {
  const { start, end } = useMemo(() => {
    const lastMonth = addMonths(new Date(), -1)
    return {
      start: formatDate(startOfMonth(lastMonth), 'MMM DD, YYYY'),
      end: formatDate(endOfMonth(lastMonth), 'MMM DD, YYYY'),
    }
  }, [])

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <div className="bg-[#124e66] p-5">
        <h1 className="flex items-center gap-3 text-xl font-medium text-white md:text-2xl">
          <BarChart3 size={28} /> Abbi Leads Report
        </h1>
        <p className="mt-1 text-sm text-white/75">Last Month Report ( {start} - {end} )</p>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <GroupingTable />
          <UserCharts />
          <PageDetailTable />
          <ConversionDayChart />
          <LowerChart />
          <ConversionDeviceChart />
        </div>
      </div>
    </div>
  )
}
