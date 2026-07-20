'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RefreshCw, Earth, MapPin, Megaphone, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { useOrgStore, useOrgServices } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { arrangeUnitOfTime } from '@/lib/utils/unitOfTime'
import { HighchartsChart } from '@/components/HighchartsChart'
import { MobileCard } from '@/components/customers/MobileCard'
import type Highcharts from 'highcharts'
import type { Service, ServicePlan } from '@/types/api'

type Plan = ServicePlan['plan']

const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? ''
const LOADER_TEXTS = [
  "Starting ABBI.AI's search engine algorithm",
  'Downloading positioning',
  'Preparing to calculate',
  'Calculating rankings',
]

interface KeywordRow { keyword: string; organic: number; place: number; ad: number; target_location?: string; service_id?: number }
type SortKey = 'keyword' | 'organic' | 'place' | 'ad'

// Nuxt sends the RAW JWT as the WS `?token=` param: its `auth._token.local` cookie holds the
// bare token (Nuxt adds "Bearer " only when building the Authorization header — see
// plugins/04.secureApi.js). Next's cookie is stored already prefixed with "Bearer ", so we
// must STRIP that prefix here to send the same value Nuxt does — otherwise the backend rejects
// the socket, never pushes batch_id, and the report loads forever.
function authToken(): string {
  if (typeof document === 'undefined') return ''
  const m = document.cookie.split('; ').find((c) => c.startsWith('auth._token.local='))
  if (!m) return ''
  let raw: string
  try { raw = decodeURIComponent(m.split('=')[1] ?? '') } catch { raw = m.split('=')[1] ?? '' }
  return raw.replace(/^Bearer\s+/i, '')
}
// Nuxt chooseColor: 1–3 green, 4–9 yellow, else (0 or >9) red.
function chooseColor(rank: number): string {
  if (rank > 0 && rank <= 3) return '#038A22'
  if (rank > 3 && rank <= 9) return '#FFF200'
  return '#D70040'
}

export function KeywordsRanking() {
  const router = useRouter()
  const organization = useOrgStore((s) => s.organization)
  const storeDomain = useOrgStore((s) => s.domain)
  const locations = useOrgStore((s) => s.locations) as unknown as Array<{ id: number; city: string; target_locations?: string[] }>
  const services = useOrgServices()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, postSecure } = useSecureCalls()

  const [locationId, setLocationId] = useState<number | ''>('')
  const [rows, setRows] = useState<KeywordRow[]>([])
  const [overlay, setOverlay] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartData, setChartData] = useState<{ dates: string[]; series: { name: string; data: number[] }[] }>({ dates: [], series: [] })
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const [loaderIdx, setLoaderIdx] = useState(0)
  const [selected, setSelected] = useState<KeywordRow | null>(null)
  // Nuxt default: sort-by { key: 'organic', order: 'asc' }.
  const [sortKey, setSortKey] = useState<SortKey>('organic')
  const [sortAsc, setSortAsc] = useState(true)

  const socketRef = useRef<WebSocket | null>(null)
  const batchRef = useRef<{ batch_id?: string; download_link?: string }>({})

  // Cycle loader text while overlay is shown.
  useEffect(() => {
    if (!overlay) return
    const t = setInterval(() => setLoaderIdx((i) => (i + 1) % LOADER_TEXTS.length), 4000)
    return () => clearInterval(t)
  }, [overlay])

  const getBatchRes = useCallback(async () => {
    try {
      const res = await getSecure<KeywordRow[]>(SECURE_ENDPOINTS.KEYWORD_RANKING, {
        batch_id: batchRef.current.batch_id ?? '',
        download_link: batchRef.current.download_link ?? '',
      })
      setRows(Array.isArray(res) ? res : [])
      toast.success('SEO ranking results fetched successfully', { duration: 5000 })
    } catch { /* ignore */ } finally { setOverlay(false) }
  }, [getSecure])

  // WebSocket: server pushes { batch_id, download_link } when the scrape completes.
  // Nuxt opens this socket once (onMounted, admin-only) and closes it once (onBeforeUnmount).
  // We mirror that: connect once per org id — isAdminLoggedIn/getBatchRes are intentionally
  // NOT deps (they're unstable useCallbacks; re-running would reopen the socket every render).
  // Cleanup must never call close() on a still-CONNECTING socket, or the browser logs
  // "WebSocket is closed before the connection is established" (also fires under React
  // StrictMode's dev double-invoke): if it's still connecting, close it once it opens.
  useEffect(() => {
    if (!organization?.id || !WS_URL || !isAdminLoggedIn()) return
    const ws = new WebSocket(`${WS_URL}/serp/notify/${organization.id}/?token=${authToken()}`)
    socketRef.current = ws
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        if (data?.batch_id) { batchRef.current = { batch_id: data.batch_id, download_link: data.download_link }; getBatchRes() }
      } catch { /* ignore */ }
    }
    return () => {
      ws.onmessage = null
      if (ws.readyState === WebSocket.CONNECTING) ws.onopen = () => ws.close()
      else if (ws.readyState === WebSocket.OPEN) ws.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id])

  const requestBatch = useCallback(async (id: number) => {
    setOverlay(true)
    try { await postSecure(SECURE_ENDPOINTS.KEYWORD_RANKING, { location_id: id }) }
    catch { setOverlay(false); toast.error('batch request could not be made', { duration: 5000 }) }
  }, [postSecure])

  const getRankingChart = useCallback(async (id: number) => {
    setChartLoading(true)
    try {
      const res = await postSecure<{ dates: string[]; keywords_data: Record<string, number[]> }>(SECURE_ENDPOINTS.RANKING_CHART, { location_id: id })
      const kd = res?.keywords_data ?? {}
      setChartData({ dates: res?.dates ?? [], series: Object.entries(kd).map(([name, data]) => ({ name, data })) })
    } catch { /* ignore */ } finally { setChartLoading(false) }
  }, [postSecure])

  useEffect(() => {
    if (locations && locations.length > 0 && locationId === '') setLocationId(locations[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations])

  useEffect(() => {
    if (locationId !== '') { requestBatch(locationId); getRankingChart(locationId) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId])

  const sortedRows = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''))
      return sortAsc ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / itemsPerPage))
  const pageItems = sortedRows.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const rangeStart = sortedRows.length ? (page - 1) * itemsPerPage + 1 : 0
  const rangeEnd = Math.min(page * itemsPerPage, sortedRows.length)

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((a) => !a)
    else { setSortKey(key); setSortAsc(true) }
    setPage(1)
  }

  const chartOptions = useMemo(() => ({
    chart: { type: 'spline', height: 320 },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: { categories: chartData.dates, labels: { rotation: -45, style: { fontSize: '10px' } }, title: { text: 'DateTime' } },
    yAxis: { title: { text: 'Rankings' } },
    tooltip: { shared: true },
    series: chartData.series,
  } as Highcharts.Options), [chartData])

  const pill = (rank: number, item: KeywordRow) => {
    const color = chooseColor(rank)
    const green = color === '#038A22'
    return (
      <button
        disabled={green}
        onClick={() => !green && setSelected(item)}
        style={{ backgroundColor: color, color: '#fff' }}
        className="rounded-full px-3 py-1 text-xs font-semibold disabled:cursor-default"
        title={green ? 'Ranking well' : 'Create a Google Search Ad'}
      >
        {rank <= 10 ? rank : '10+'}
      </button>
    )
  }

  const locationTitle = (l: { city: string; target_locations?: string[] }) => (l.target_locations && l.target_locations[0]) || l.city

  const sortHeader = (label: string, colKey: SortKey) => (
    <th className="px-4 py-3 font-semibold">
      <button type="button" onClick={() => toggleSort(colKey)} className="inline-flex items-center gap-1 hover:text-[#124e66]">
        {label}
        <span className="text-xs text-gray-400">{sortKey === colKey ? (sortAsc ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  )

  return (
    <div className="relative min-h-full bg-[#f8fafc]">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-white/90">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
          <p className="text-sm font-medium text-[#124e66]">{LOADER_TEXTS[loaderIdx]}…</p>
        </div>
      )}

      <div className="bg-[#124e66] p-5">
        <h1 className="text-xl font-medium text-white md:text-2xl">Keywords / SEO Report</h1>
        <p className="mt-1 text-sm text-white/75">Track and optimize your search rankings</p>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        <div className="mb-4 max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Select a Location</label>
          <select value={locationId} onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base">
            {locations.map((l) => <option key={l.id} value={l.id}>{locationTitle(l)}</option>)}
          </select>
        </div>

        {/* Rankings chart */}
        <div className="mb-4 rounded bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 font-medium">
            Rankings over time
            <button onClick={() => locationId !== '' && getRankingChart(locationId)} disabled={chartLoading} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" aria-label="Refresh">
              <RefreshCw size={18} className={chartLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <hr className="border-gray-100" />
          <HighchartsChart options={chartOptions} style={{ background: 'transparent' }} />
        </div>

        {/* Keywords table */}
        <div className="rounded bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50"><tr>
                {sortHeader('Keyword', 'keyword')}
                {sortHeader('Google Search', 'organic')}
                {sortHeader('Google Maps', 'place')}
                {sortHeader('Google Ads', 'ad')}
              </tr></thead>
              <tbody>
                {pageItems.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3">{r.keyword}</td>
                    <td className="px-4 py-3">{pill(r.organic, r)}</td>
                    <td className="px-4 py-3">{pill(r.place, r)}</td>
                    <td className="px-4 py-3">{pill(r.ad, r)}</td>
                  </tr>
                ))}
                {pageItems.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No keyword data yet</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 p-3 md:hidden">
            {pageItems.map((r, i) => (
              <MobileCard key={i}
                header={<span className="font-medium">{r.keyword}</span>}
                rows={[
                  { icon: <Earth size={18} />, value: <span className="flex items-center gap-2"><span className="text-gray-600">Google Search:</span>{pill(r.organic, r)}</span> },
                  { icon: <MapPin size={18} />, value: <span className="flex items-center gap-2"><span className="text-gray-600">Google Maps:</span>{pill(r.place, r)}</span> },
                  { icon: <Megaphone size={18} />, value: <span className="flex items-center gap-2"><span className="text-gray-600">Google Ads:</span>{pill(r.ad, r)}</span> },
                ]}
              />
            ))}
            {pageItems.length === 0 && <p className="py-8 text-center text-gray-500">No keyword data yet</p>}
          </div>

          {/* Pagination — matches Nuxt: first/prev/next/last + "X-Y of Z" counter */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-3 text-sm text-gray-600">
            <span>{rangeStart}-{rangeEnd} of {sortedRows.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page <= 1} className="rounded border p-1 disabled:opacity-40" aria-label="First page"><ChevronsLeft size={16} /></button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border p-1 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16} /></button>
              <span className="px-2">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded border p-1 disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="rounded border p-1 disabled:opacity-40" aria-label="Last page"><ChevronsRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <SearchAddBox
          keyword={selected}
          onClose={() => setSelected(null)}
          onCreated={() => { setSelected(null); router.push('/admin/google-ads') }}
          postSecure={postSecure}
          services={services}
          locations={locations}
          orgName={organization?.name ?? ''}
          currencySign={organization?.currency_sign ?? '$'}
          domain={organization?.canonical_domain || storeDomain || ''}
        />
      )}
    </div>
  )
}

/**
 * Nuxt SearchAddBox — create a Google Search Ad for the selected keyword → POST GOOGLE_ADS.
 * Faithful to components/organization/SearchAddBox.vue:
 *  - required "Special" plan selector (headline_part2 derived from the chosen plan)
 *  - default headline "Best {service} in {location}"
 *  - submitted description is the auto-generated get_default_description() (user text is required but not sent)
 */
function SearchAddBox({ keyword, onClose, onCreated, postSecure, services, locations, orgName, currencySign, domain }: {
  keyword: KeywordRow
  onClose: () => void
  onCreated: () => void
  postSecure: <T = unknown>(url: string, data: unknown) => Promise<T>
  services: Service[]
  locations: Array<{ id: number; city: string; target_locations?: string[] }>
  orgName: string
  currencySign: string
  domain: string
}) {
  const allPlans: Plan[] = useMemo(
    () => (services.find((s) => s.id === keyword.service_id)?.service_plans ?? []).map((sp) => sp.plan),
    [services, keyword.service_id],
  )

  // Nuxt onMounted: `Best ${keyword - targetLoc} in ${targetLoc}` truncated to 29 if > 30.
  const defaultHeadline = useMemo(() => {
    const targetLoc = keyword.target_location ?? ''
    const serviceName = keyword.keyword.replace(targetLoc, '').trim()
    const text = `Best ${serviceName} in ${targetLoc}`
    return text.length > 30 ? text.substring(0, 29) : text
  }, [keyword])

  const [planIdx, setPlanIdx] = useState<number | ''>('')
  const [headline, setHeadline] = useState(defaultHeadline)
  const [description, setDescription] = useState('')
  const [monthlyBudget, setMonthlyBudget] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const finalUrl = (domain || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none'
  const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

  const planLabel = (p: Plan) =>
    `${p.amount_of_units} ${arrangeUnitOfTime(p.amount_of_units, p.unit_of_time)} For ${currencySign}${p.discounted_price ? p.discounted_price : p.price}`

  // Nuxt get_default_description() — always sent as description/description2, truncated to 89.
  const getDefaultDescription = () => {
    const location = locations[0]
    const loc = (location?.target_locations && location.target_locations[0]) || ''
    const s0 = services[0]?.name ?? ''
    const s1 = services.length > 1 ? services[1]?.name ?? '' : ''
    const desc = `${orgName} is ${loc}'s premier ${s0} and ${s1} training centers`
    return desc.length > 90 ? desc.substring(0, 89) : desc
  }

  const create = async () => {
    if (planIdx === '') { toast.error('Fields Required', { duration: 10000 }); return }
    if (!headline.trim() || headline.length > 30) { toast.error('Fields Required', { duration: 10000 }); return }
    if (!description.trim() || description.length > 90) { toast.error('Fields Required', { duration: 10000 }); return }
    if (monthlyBudget === '' || Number(monthlyBudget) < 30) { toast.error('Monthly Budget should be greater or equal to 30', { duration: 10000 }); return }

    const plan = allPlans[planIdx]
    const priceRaw = plan.discounted_price ? Math.floor(Number(plan.discounted_price)) : Math.floor(Number(plan.price))
    const desc = getDefaultDescription()
    setSaving(true)
    try {
      await postSecure(SECURE_ENDPOINTS.GOOGLE_ADS, {
        google_ads_data: [{
          final_url: finalUrl,
          description: desc,
          description2: desc,
          headline_part1: headline,
          headline_part2: `${plan.amount_of_units} ${plan.unit_of_time} for ${currencySign}${priceRaw}`,
          headline_part3: orgName,
        }],
        monthly_budget: monthlyBudget,
      })
      toast.success('Google Ads created Successfully', { duration: 3000 })
      onCreated()
    } catch { toast.error('Could not create the ad', { duration: 5000 }) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[700px] rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Megaphone size={40} className="text-[#124e66]" />
            <h4 className="text-lg font-semibold">Create a Google Search Ad</h4>
          </div>
          <button onClick={onClose} aria-label="Close"><X size={22} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className={LABEL}>Special *</label>
            <select className={FIELD} value={planIdx} onChange={(e) => setPlanIdx(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="" disabled>Select a plan</option>
              {allPlans.map((p, i) => <option key={i} value={i}>{planLabel(p)}</option>)}
            </select>
          </div>
          <div><label className={LABEL}>Monthly Budget * <span className="text-xs text-gray-400">(≥30)</span></label><input type="number" min={30} className={FIELD} value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value === '' ? '' : Number(e.target.value))} /></div>
          <div><label className={LABEL}>Headline * <span className="text-xs text-gray-400">(≤30)</span></label><input maxLength={30} className={FIELD} value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
          <div><label className={LABEL}>Description * <span className="text-xs text-gray-400">(≤90)</span></label><textarea maxLength={90} rows={3} className={FIELD} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button onClick={create} disabled={saving} className="rounded bg-[#1565C0] px-6 py-2.5 font-medium uppercase text-white disabled:opacity-50">{saving ? 'Creating…' : 'Add'}</button>
          <button onClick={onClose} className="rounded bg-gray-200 px-6 py-2.5 font-medium uppercase text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}
