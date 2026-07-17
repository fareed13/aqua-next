'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Row { pageTitle: string; screenPageViews: number; effect: number }

function EffectChip({ effect }: { effect: number }) {
  const pos = Number(effect) > 0
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pos ? 'bg-[#e6f4ea] text-[#2e7d32]' : 'bg-[#fdecea] text-[#d32f2f]'}`}>
      {effect}%
    </span>
  )
}

/** Nuxt PageDetailTable — "Page Traffic", 5 rows/page. */
export function PageDetailTable() {
  const { getSecure } = useSecureCalls()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 5

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSecure<Row[]>(SECURE_ENDPOINTS.LEADS_ANALYTICS_PAGE_VIEWS, {})
      setRows(Array.isArray(res) ? res : [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [getSecure])
  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage))
  const pageItems = rows.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="flex h-full flex-col rounded bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 font-medium">
        Page Traffic
        <button onClick={fetchData} disabled={loading} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" aria-label="Refresh">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <hr className="border-gray-100" />
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600"><tr>
            <th className="px-3 py-2 font-medium">Page Title</th>
            <th className="px-3 py-2 font-medium">Views</th>
            <th className="px-3 py-2 font-medium">%</th>
          </tr></thead>
          <tbody>
            {pageItems.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{(r.pageTitle ?? '').split('|')[0]}</td>
                <td className="px-3 py-2">{r.screenPageViews}</td>
                <td className="px-3 py-2"><EffectChip effect={r.effect} /></td>
              </tr>
            ))}
            {pageItems.length === 0 && <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-400">No data</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 px-3 py-2 text-xs text-gray-500">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-2 py-0.5 disabled:opacity-40">‹</button>
        <span>{page}/{totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded border px-2 py-0.5 disabled:opacity-40">›</button>
      </div>
    </div>
  )
}
