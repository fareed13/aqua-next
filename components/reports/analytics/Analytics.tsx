'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { formatDate, addDays, startOfMonth, endOfMonth, addMonths } from '@/lib/utils/dateTime'
import { UsersChart } from './UsersChart'
import { LeadsChart } from './LeadsChart'
import { TrialChart } from './TrialChart'
import { LeadAndPurchaseChart } from './LeadAndPurchaseChart'
import { UserPageChart } from './UserPageChart'
import { UserAreaChart } from './UserAreaChart'
import { ProgramChart } from './ProgramChart'

const iso = (d: Date) => formatDate(d, 'YYYY-MM-DD')

const PRESETS: { key: string; label: string; range: () => { from: string; to: string } }[] = [
  { key: 'last7', label: 'Last 7 Days', range: () => ({ from: iso(addDays(new Date(), -6)), to: iso(new Date()) }) },
  { key: 'last28', label: 'Last 28 Days', range: () => ({ from: iso(addDays(new Date(), -27)), to: iso(new Date()) }) },
  { key: 'last30', label: 'Last 30 Days', range: () => ({ from: iso(addDays(new Date(), -29)), to: iso(new Date()) }) },
  { key: 'last90', label: 'Last 90 Days', range: () => ({ from: iso(addDays(new Date(), -89)), to: iso(new Date()) }) },
  { key: 'thisMonth', label: 'This Month', range: () => ({ from: iso(startOfMonth(new Date())), to: iso(new Date()) }) },
  { key: 'lastMonth', label: 'Last Month', range: () => ({ from: iso(startOfMonth(addMonths(new Date(), -1))), to: iso(endOfMonth(addMonths(new Date(), -1))) }) },
]

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 pl-3 text-sm font-semibold uppercase text-[#8a8a8a] sm:pl-0">{children}</p>
)

/** Nuxt Analytics — Dashboard container: date-range filter + all analytics charts (ANALYTICS_ALL). */
export function Analytics() {
  const domain = useOrgStore((s) => s.domain)
  const { getSecure } = useSecureCalls()

  const [preset, setPreset] = useState('last90')
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null)
  const [analytics, setAnalytics] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)

  const range = useMemo(() => {
    if (custom?.from && custom?.to) return custom
    return (PRESETS.find((p) => p.key === preset) ?? PRESETS[3]).range()
  }, [preset, custom])
  const label = custom ? `${custom.from} - ${custom.to}` : (PRESETS.find((p) => p.key === preset)?.label ?? '')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSecure<Record<string, any>>(SECURE_ENDPOINTS.ANALYTICS_ALL, { domain, from: range.from, to: range.to })
      setAnalytics(res ?? {})
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [getSecure, domain, range.from, range.to])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="relative min-h-full bg-[#f8fafc]">
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      <div className="flex flex-col gap-3 bg-[#124e66] p-5 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-medium text-white md:text-2xl">Dashboard: <span className="text-white/80">{label}</span></h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select value={custom ? '' : preset} onChange={(e) => { setCustom(null); setPreset(e.target.value) }} className="rounded-md bg-white px-3 py-2 text-sm">
            {PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={custom?.from ?? ''} onChange={(e) => setCustom((c) => ({ from: e.target.value, to: c?.to ?? e.target.value }))} className="rounded-md bg-white px-2 py-2 text-sm" />
            <span className="text-white/70">–</span>
            <input type="date" value={custom?.to ?? ''} onChange={(e) => setCustom((c) => ({ from: c?.from ?? e.target.value, to: e.target.value }))} className="rounded-md bg-white px-2 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6">
        <div><UsersChart analytics={analytics ?? undefined} date_range={label} /></div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label>Total leads by date:</Label><LeadsChart analytics={analytics ?? undefined} date_range={label} /></div>
          <div><Label>Total Trials by date:</Label><TrialChart analytics={analytics ?? undefined} date_range={label} /></div>
        </div>

        <div><Label>Leads And Purchases by Source:</Label><LeadAndPurchaseChart analytics={analytics ?? undefined} date_range={label} /></div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div><Label>Which pages are visited most often?</Label><UserPageChart analytics={analytics ?? undefined} date_range={label} /></div>
          <div><Label>Which area have the most users?</Label><UserAreaChart analytics={analytics ?? undefined} date_range={label} /></div>
          <div><Label>Which programs are visited most often?</Label><ProgramChart analytics={analytics ?? undefined} date_range={label} /></div>
        </div>
      </div>
    </div>
  )
}
