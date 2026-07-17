'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { MultiSelectChips } from '@/components/customers/MultiSelectChips'
import { Pagination } from '@/components/admin/belts/BeltsList'

type TabKey = 'Trial Purchases' | 'Gift Card Purchases' | 'Event Purchases'
const TABS: TabKey[] = ['Trial Purchases', 'Gift Card Purchases', 'Event Purchases']

interface Col { title: string; render: (item: any) => ReactNode }

function fullName(c: any): string {
  return c ? `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() : ''
}
function price(p: any): string {
  return p === '0.00' ? 'Free' : (p ?? '')
}
// 'YYYY-MM-DD, dddd' (Nuxt gift-card purchase_date format).
function fmtDateWeekday(s?: string): string {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}, ${weekday}`
}
// Format 'YYYY-MM-DD hh:mm A'. utc=true parses "YYYY-MM-DD HH:mm[:ss]" as UTC and
// displays in UTC (Nuxt formattedDate uses formatDateUTC for the event start).
function fmt12(s?: string, utc = false): string {
  if (!s) return ''
  const d = new Date(utc ? s.trim().replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? '' : 'Z') : s)
  if (isNaN(d.getTime())) return ''
  const Y = utc ? d.getUTCFullYear() : d.getFullYear()
  const M = (utc ? d.getUTCMonth() : d.getMonth()) + 1
  const D = utc ? d.getUTCDate() : d.getDate()
  const h24 = utc ? d.getUTCHours() : d.getHours()
  const mi = utc ? d.getUTCMinutes() : d.getMinutes()
  const ampm = h24 >= 12 ? 'PM' : 'AM'
  const h = h24 % 12 || 12
  const p = (n: number) => String(n).padStart(2, '0')
  return `${Y}-${p(M)}-${p(D)} ${p(h)}:${p(mi)} ${ampm}`
}

const TRIAL_COLS: Col[] = [
  { title: 'Plan', render: (i) => i.plan?.name },
  { title: 'Customer', render: (i) => fullName(i.customer) },
  { title: 'Quantity', render: (i) => i.quantity },
  { title: 'Price Charged', render: (i) => price(i.price_charged) },
  { title: 'Purchased Date', render: (i) => fmt12(i.created_at) },
]
const GIFT_COLS: Col[] = [
  { title: 'Sender', render: (i) => fullName(i.sender) },
  { title: 'Recipient', render: (i) => fullName(i.recipient) },
  { title: 'Program', render: (i) => i.service?.name },
  { title: 'Price', render: (i) => price(i.price_charged) },
  { title: 'Purchase Date', render: (i) => fmtDateWeekday(i.purchase_date) },
]
const EVENT_COLS: Col[] = [
  { title: 'Event', render: (i) => i.event?.name },
  { title: 'Customer', render: (i) => fullName(i.customer) },
  { title: 'Quantity', render: (i) => i.quantity },
  { title: 'Price Charged', render: (i) => price(i.price_charged) },
  { title: 'Purchased Date', render: (i) => fmt12(i.created_at) },
  { title: 'Event Date', render: (i) => fmt12(i.event?.start_datetime, true) },
]

export function Purchases() {
  const locations = useOrgStore((s) => s.locations) as unknown as Array<{ id: number; city: string; target_locations?: string[] }>
  const { getSecure } = useSecureCalls()

  const [tab, setTab] = useState<TabKey>('Trial Purchases')
  const [trial, setTrial] = useState<any[]>([])
  const [gift, setGift] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [selectedLocations, setSelectedLocations] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [overlay, setOverlay] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const fetchTab = async (t: TabKey) => {
    setOverlay(true)
    try {
      const params = selectedLocations.length ? { locations: selectedLocations.join(',') } : {}
      if (t === 'Trial Purchases') {
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.PLAN_PURCHASED, params)
        setTrial((Array.isArray(res) ? res : []).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)))
      } else if (t === 'Event Purchases') {
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.EVENT_PURCHASED, params)
        setEvents(Array.isArray(res) ? res : [])
      } else {
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.GIFT_CARD, params)
        setGift(Array.isArray(res) ? res : [])
      }
    } catch {
      if (t === 'Trial Purchases') setTrial([])
      else if (t === 'Event Purchases') setEvents([])
      else setGift([])
    } finally { setOverlay(false) }
  }

  useEffect(() => {
    fetchTab('Trial Purchases')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cols = tab === 'Trial Purchases' ? TRIAL_COLS : tab === 'Gift Card Purchases' ? GIFT_COLS : EVENT_COLS
  const items = tab === 'Trial Purchases' ? trial : tab === 'Gift Card Purchases' ? gift : events

  // Nuxt filters by customer.first_name (gift cards have no customer → emptied when searching).
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter((i) => (i.customer?.first_name?.toLowerCase() || '').includes(q))
  }, [items, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => { setPage(1) }, [tab, search, perPage])

  const switchTab = (t: TabKey) => { setTab(t); setSearch(''); fetchTab(t) }

  return (
    <div className="min-h-full bg-white">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      {/* Header bar: search (left), location filter + FILTER (right) */}
      <div className="flex flex-col gap-4 bg-[rgb(18,82,105)] px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Purchases..." className="w-full rounded-md bg-white py-2.5 pl-10 pr-3 text-base outline-none" />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div>
            <span className="mb-1 block text-xs uppercase text-white/90">Select Location</span>
            <div className="min-w-[220px]">
              <MultiSelectChips
                options={locations.map((l) => ({ id: l.id, name: (l.target_locations && l.target_locations[0]) || l.city }))}
                value={selectedLocations}
                onChange={setSelectedLocations}
                placeholder="All locations"
              />
            </div>
          </div>
          <button onClick={() => fetchTab(tab)} className="h-[46px] rounded bg-white px-6 font-semibold text-[#124e66]">FILTER</button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-10">
        {/* Centered tabs */}
        <div className="flex justify-center overflow-x-auto border-b">
          {TABS.map((t) => (
            <button key={t} onClick={() => switchTab(t)} className={`whitespace-nowrap px-5 py-3 text-sm font-bold ${tab === t ? 'border-b-2 border-[#1976d2] text-black' : 'text-gray-600 hover:text-black'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50"><tr>
                {cols.map((c) => <th key={c.title} className="px-4 py-3 font-semibold">{c.title}</th>)}
              </tr></thead>
              <tbody>
                {pageItems.map((it, idx) => (
                  <tr key={it.id ?? idx} className="border-b hover:bg-gray-50">
                    {cols.map((c) => <td key={c.title} className="px-4 py-3 whitespace-nowrap">{c.render(it)}</td>)}
                  </tr>
                ))}
                {pageItems.length === 0 && <tr><td colSpan={cols.length} className="px-4 py-10 text-center text-gray-500">No Records Found</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {pageItems.map((it, idx) => (
              <div key={it.id ?? idx} className="rounded border border-gray-200 bg-white p-3 text-sm shadow-sm">
                <div className="mb-1 font-semibold">{cols[0].render(it)}</div>
                {cols.slice(1).map((c) => (
                  <div key={c.title} className="flex justify-between gap-3 py-0.5">
                    <span className="text-gray-500">{c.title}</span>
                    <span className="text-right">{c.render(it)}</span>
                  </div>
                ))}
              </div>
            ))}
            {pageItems.length === 0 && <p className="py-10 text-center text-gray-500">No Records Found</p>}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={filtered.length} options={[5, 10, 15, 20]} />
        </div>
      </div>
    </div>
  )
}
