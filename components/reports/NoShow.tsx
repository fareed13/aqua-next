'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { UserX, User, Mail, Search } from 'lucide-react'
import { MobileCard } from '@/components/customers/MobileCard'

export function NoShowReport() {
  const router = useRouter()
  const { getSecure, secureEndpoint } = useSecureCalls()

  const [search, setSearch] = useState('')
  const [lastVisit, setLastVisit] = useState(15)
  const [pastLastVisit, setPastLastVisit] = useState(30)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const filtered = useMemo(() => {
    if (!search) return customers
    const s = search.toLowerCase()
    return customers.filter(c =>
      (c.first_name ?? '').toLowerCase().includes(s) ||
      (c.last_name ?? '').toLowerCase().includes(s) ||
      (c.email ?? '').toLowerCase().includes(s)
    )
  }, [customers, search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const pageItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  async function fetchData() {
    try {
      setLoading(true)
      const res = await getSecure(secureEndpoint.NO_SHOW_REPORT, { breakpoint: lastVisit, end_span: pastLastVisit })
      setCustomers(Array.isArray(res) ? res : [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div>
      <div className="bg-[#124e66] p-6 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <UserX className="text-white" size={32} />
          <div>
            <h1 className="text-xl font-semibold text-white mb-0">No Show Report</h1>
            <p className="text-sm text-white/70 mb-0">Track student attendance</p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none"
          />
        </div>
      </div>

      <div className="bg-[#f5f5f5] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Days Since Last Visit</label>
            <input type="number" value={lastVisit} onChange={e => setLastVisit(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Days To Ignore Past Last Visit</label>
            <input type="number" value={pastLastVisit} onChange={e => setPastLastVisit(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <button onClick={() => { setPage(1); fetchData() }} disabled={loading} className="justify-self-start rounded bg-[#1565C0] px-6 h-10 text-sm font-medium uppercase tracking-wide text-white shadow-sm hover:bg-[#1257a8] disabled:opacity-50">
            {loading ? 'Loading…' : 'Apply Filter'}
          </button>
        </div>
        {customers.length > 0 && (
          <p className="text-center mt-4 mb-0 text-base">
            Students that have not shown up in {lastVisit} days, but did show before {pastLastVisit} days ago.
          </p>
        )}
      </div>

      <div className="bg-white rounded shadow">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['First Name', 'Last Name', 'Email'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">Loading…</td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">No results</td></tr>
              ) : pageItems.map((c, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/customers/${c.id}`)}>
                  <td className="px-4 py-3">{c.first_name}</td>
                  <td className="px-4 py-3">{c.last_name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3 p-3">
          {loading ? <p className="py-6 text-center text-gray-400">Loading…</p>
            : pageItems.length === 0 ? <p className="py-6 text-center text-gray-400">No results</p>
            : pageItems.map((c, i) => (
              <div key={i} onClick={() => router.push(`/customers/${c.id}`)}>
                <MobileCard
                  header={<><User size={18} className="text-[#6D6D6D]" /><span className="font-medium">{c.first_name} {c.last_name}</span></>}
                  rows={[{ icon: <Mail size={18} />, value: c.email }]}
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
