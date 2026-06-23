'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { UserX } from 'lucide-react'

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
      const res = await getSecure(secureEndpoint.NO_SHOW_REPORT, { last_visit: lastVisit, past_last_visit: pastLastVisit })
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
            <p className="text-sm text-white/70 mb-0">Members who haven't visited recently</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="border rounded px-3 py-2 text-sm w-full sm:w-72"
        />
      </div>

      <div className="bg-white rounded shadow p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Last visit (days ago)</label>
          <input type="number" value={lastVisit} onChange={e => setLastVisit(Number(e.target.value))} className="border rounded px-3 py-2 text-sm w-32" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Past last visit (days)</label>
          <input type="number" value={pastLastVisit} onChange={e => setPastLastVisit(Number(e.target.value))} className="border rounded px-3 py-2 text-sm w-32" />
        </div>
        <button onClick={() => { setPage(1); fetchData() }} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded text-sm disabled:opacity-50">
          {loading ? 'Loading…' : 'Apply Filter'}
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
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
