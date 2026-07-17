'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { RefreshCw, Earth, MapPin, Megaphone, X } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { HighchartsChart } from '@/components/HighchartsChart'
import { MobileCard } from '@/components/customers/MobileCard'

const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? ''
const LOADER_TEXTS = [
  "Starting ABBI.AI's search engine algorithm",
  'Downloading positioning',
  'Preparing to calculate',
  'Calculating rankings',
]

interface KeywordRow { keyword: string; organic: number; place: number; ad: number; target_location?: string; service_id?: number }

function authToken(): string {
  if (typeof document === 'undefined') return ''
  const m = document.cookie.split('; ').find((c) => c.startsWith('auth._token.local='))
  if (!m) return ''
  const raw = decodeURIComponent(m.split('=')[1] ?? '')
  return raw.replace(/^Bearer\s+/i, '')
}
function chooseColor(rank: number): string {
  if (rank >= 1 && rank <= 3) return '#038A22'
  if (rank >= 4 && rank <= 9) return '#FFF200'
  return '#D70040'
}

export function KeywordsRanking() {
  const organization = useOrgStore((s) => s.organization)
  const locations = useOrgStore((s) => s.locations) as unknown as Array<{ id: number; city: string; target_locations?: string[] }>
  const { getSecure, postSecure } = useSecureCalls()

  const [locationId, setLocationId] = useState<number | ''>('')
  const [rows, setRows] = useState<KeywordRow[]>([])
  const [overlay, setOverlay] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartData, setChartData] = useState<{ dates: string[]; series: { name: string; data: number[] }[] }>({ dates: [], series: [] })
  const [page, setPage] = useState(1)
  const perPage = 10
  const [loaderIdx, setLoaderIdx] = useState(0)
  const [selected, setSelected] = useState<KeywordRow | null>(null)

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
  useEffect(() => {
    if (!organization?.id || !WS_URL) return
    const ws = new WebSocket(`${WS_URL}/serp/notify/${organization.id}/?token=${authToken()}`)
    socketRef.current = ws
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data)
        if (data?.batch_id) { batchRef.current = { batch_id: data.batch_id, download_link: data.download_link }; getBatchRes() }
      } catch { /* ignore */ }
    }
    return () => { ws.close() }
  }, [organization?.id, getBatchRes])

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

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage))
  const pageItems = rows.slice((page - 1) * perPage, page * perPage)

  const chartOptions = useMemo(() => ({
    chart: { type: 'spline', height: 320 },
    title: { text: '' },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: { categories: chartData.dates, labels: { rotation: -45 }, title: { text: 'Date' } },
    yAxis: { title: { text: 'Rankings' }, reversed: true },
    tooltip: { shared: true },
    series: chartData.series,
  } as any), [chartData])

  const pill = (rank: number, item: KeywordRow) => {
    const color = chooseColor(rank)
    const green = color === '#038A22'
    return (
      <button
        disabled={green}
        onClick={() => !green && setSelected(item)}
        style={{ backgroundColor: color, color: color === '#FFF200' ? '#333' : '#fff' }}
        className="rounded-full px-3 py-1 text-xs font-semibold disabled:cursor-default"
        title={green ? 'Ranking well' : 'Create a Google Search Ad'}
      >
        {rank <= 10 ? rank : '10+'}
      </button>
    )
  }

  const locationTitle = (l: { city: string; target_locations?: string[] }) => (l.target_locations && l.target_locations[0]) || l.city

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
                <th className="px-4 py-3 font-semibold">Keyword</th>
                <th className="px-4 py-3 font-semibold">Google Search</th>
                <th className="px-4 py-3 font-semibold">Google Maps</th>
                <th className="px-4 py-3 font-semibold">Google Ads</th>
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
                  { icon: <Earth size={18} />, value: pill(r.organic, r) },
                  { icon: <MapPin size={18} />, value: pill(r.place, r) },
                  { icon: <Megaphone size={18} />, value: pill(r.ad, r) },
                ]}
              />
            ))}
            {pageItems.length === 0 && <p className="py-8 text-center text-gray-500">No keyword data yet</p>}
          </div>
          <div className="flex items-center justify-end gap-2 px-4 py-3 text-sm text-gray-500">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-2 py-1 disabled:opacity-40">‹</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded border px-2 py-1 disabled:opacity-40">›</button>
          </div>
        </div>
      </div>

      {selected && <SearchAddBox keyword={selected} onClose={() => setSelected(null)} postSecure={postSecure} orgName={organization?.name ?? ''} domain={(organization as any)?.canonical_domain ?? ''} />}
    </div>
  )
}

/** Nuxt SearchAddBox — create a Google Search Ad for the selected keyword → POST GOOGLE_ADS. */
function SearchAddBox({ keyword, onClose, postSecure, orgName, domain }: {
  keyword: KeywordRow
  onClose: () => void
  postSecure: <T = unknown>(url: string, data: unknown) => Promise<T>
  orgName: string
  domain: string
}) {
  const [headline1, setHeadline1] = useState(keyword.keyword.slice(0, 30))
  const [headline2, setHeadline2] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState<number | ''>(30)
  const [saving, setSaving] = useState(false)

  const finalUrl = (domain || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none'
  const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

  const create = async () => {
    if (!headline1.trim() || headline1.length > 30) { toast.error('Headline is required (max 30 chars)'); return }
    if (description.length > 90) { toast.error('Description must be ≤ 90 characters'); return }
    if (budget === '' || Number(budget) < 30) { toast.error('Monthly budget must be ≥ 30'); return }
    setSaving(true)
    try {
      await postSecure(SECURE_ENDPOINTS.GOOGLE_ADS, {
        google_ads_data: [{
          final_url: finalUrl,
          description, description2: description,
          headline_part1: headline1, headline_part2: headline2, headline_part3: orgName,
        }],
        monthly_budget: Number(budget),
      })
      toast.success('Google Ad created successfully', { duration: 5000 })
      onClose()
    } catch { toast.error('Could not create the ad', { duration: 5000 }) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Create a Google Search Ad</h2>
          <button onClick={onClose} aria-label="Close"><X size={22} /></button>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm text-gray-500">Keyword: <span className="font-medium text-gray-800">{keyword.keyword}</span></p>
          <div><label className={LABEL}>Headline 1 * <span className="text-xs text-gray-400">(≤30)</span></label><input maxLength={30} className={FIELD} value={headline1} onChange={(e) => setHeadline1(e.target.value)} /></div>
          <div><label className={LABEL}>Headline 2 <span className="text-xs text-gray-400">(≤30)</span></label><input maxLength={30} className={FIELD} value={headline2} onChange={(e) => setHeadline2(e.target.value)} /></div>
          <div><label className={LABEL}>Description <span className="text-xs text-gray-400">(≤90)</span></label><textarea maxLength={90} rows={3} className={FIELD} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><label className={LABEL}>Monthly Budget * <span className="text-xs text-gray-400">(≥30)</span></label><input type="number" min={30} className={FIELD} value={budget} onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))} /></div>
        </div>
        <div className="flex gap-3 border-t px-6 py-4">
          <button onClick={create} disabled={saving} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50">{saving ? 'Creating…' : 'Add'}</button>
          <button onClick={onClose} className="rounded bg-gray-200 px-6 py-2.5 font-medium text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}
