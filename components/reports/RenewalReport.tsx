'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { formatDate, startOfMonth, endOfMonth } from '@/lib/utils/dateTime'
import { RefreshCw, User, Mail, Package, Calendar, Search } from 'lucide-react'
import { MobileCard } from '@/components/customers/MobileCard'

const isoDate = (d: Date) => formatDate(d, 'YYYY-MM-DD')

export function RenewalReport() {
  const router = useRouter()
  const { getSecure, secureEndpoint } = useSecureCalls()

  const [search, setSearch] = useState('')
  // Nuxt defaults to the current month range and fetches with it.
  const [startDate, setStartDate] = useState(() => isoDate(startOfMonth(new Date())))
  const [endDate, setEndDate] = useState(() => isoDate(endOfMonth(new Date())))
  const [loading, setLoading] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const filtered = useMemo(() => {
    if (!search) return subscriptions
    const s = search.toLowerCase()
    return subscriptions.filter(sub =>
      (sub.customer?.first_name ?? '').toLowerCase().includes(s) ||
      (sub.customer?.last_name ?? '').toLowerCase().includes(s) ||
      (sub.customer?.email ?? '').toLowerCase().includes(s)
    )
  }, [subscriptions, search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const pageItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  async function fetchData() {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (startDate) params.start = startDate
      if (endDate) params.end = endDate
      const res = await getSecure(secureEndpoint.RENEWAL_REPORT, params)
      setSubscriptions(Array.isArray(res) ? res : [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div>
      <div className="bg-[#124e66] p-6 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="text-white" size={32} />
          <div>
            <h1 className="text-xl font-semibold text-white mb-0">Renewal Report</h1>
            <p className="text-sm text-white/70 mb-0">Track subscription renewals</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <button onClick={() => { setPage(1); fetchData() }} disabled={loading} className="h-[42px] rounded bg-[#124e66] text-white px-6 text-sm font-medium disabled:opacity-50">
          {loading ? 'Loading…' : 'Apply Filter'}
        </button>
      </div>

      <div className="bg-white rounded shadow">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['First Name', 'Last Name', 'Email', 'Plan', 'Subscription Ending On'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading…</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No results</td></tr>
              ) : pageItems.map((sub, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/customers/${sub.customer?.id}`)}>
                  <td className="px-4 py-3">{sub.customer?.first_name}</td>
                  <td className="px-4 py-3">{sub.customer?.last_name}</td>
                  <td className="px-4 py-3">{sub.customer?.email}</td>
                  <td className="px-4 py-3">{sub.plan?.name}</td>
                  <td className="px-4 py-3">{sub.end_date ? formatDate(sub.end_date, 'DD MMM YYYY') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3 p-3">
          {loading ? <p className="py-6 text-center text-gray-400">Loading…</p>
            : pageItems.length === 0 ? <p className="py-6 text-center text-gray-400">No results</p>
            : pageItems.map((sub, i) => (
              <div key={i} onClick={() => router.push(`/customers/${sub.customer?.id}`)}>
                <MobileCard
                  header={<><User size={18} className="text-[#6D6D6D]" /><span className="font-medium">{sub.customer?.first_name} {sub.customer?.last_name}</span></>}
                  rows={[
                    { icon: <Mail size={18} />, value: sub.customer?.email },
                    { icon: <Package size={18} />, value: sub.plan?.name },
                    { icon: <Calendar size={18} />, value: sub.end_date ? formatDate(sub.end_date, 'DD MMM YYYY') : '' },
                  ]}
                />
              </div>
            ))}
        </div>
        <div className="flex justify-between items-center px-4 py-3 border-t text-sm">
          <span className="text-gray-500">{filtered.length} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-30">Prev</button>
            <span className="px-3 py-1">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-30">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
