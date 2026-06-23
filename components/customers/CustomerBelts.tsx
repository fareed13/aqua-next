'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  id: number
  first_name: string
  [key: string]: unknown
}

interface Rank {
  id: number
  name: string
}

interface Belt {
  id: number
  rank: Rank
  created_at: string
  [key: string]: unknown
}

interface CustomerBeltsProps {
  contact: Contact
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const hours = d.getHours()
    const mins = pad(d.getMinutes())
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h12 = pad(hours % 12 || 12)
    return `${year}-${month}-${day} - (${h12}:${mins} ${ampm})`
  } catch {
    return dateStr
  }
}

export function CustomerBelts({ contact }: CustomerBeltsProps) {
  const { getSecure, postSecure, deleteSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [belts, setBelts] = useState<Belt[]>([])
  const [ranks, setRanks] = useState<Rank[]>([])
  const [selectedRank, setSelectedRank] = useState<number | null>(null)
  const [deletePopup, setDeletePopup] = useState(false)
  const [selectedBelt, setSelectedBelt] = useState<Belt | null>(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [beltsRes, ranksRes] = await Promise.all([
          getSecure<any>(SECURE_ENDPOINTS.CUSTOMER_BUILDER, { contact: contact.id }),
          getSecure<any>(SECURE_ENDPOINTS.SERVICE_RANK),
        ])
        setBelts(Array.isArray(beltsRes) ? beltsRes : beltsRes?.results ?? [])
        setRanks(Array.isArray(ranksRes) ? ranksRes : ranksRes?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contact.id])

  const filteredRanks = useMemo(() => {
    if (belts.length === 0) return ranks
    return ranks.filter(r => !belts.find(b => b.rank.id === r.id))
  }, [ranks, belts])

  const totalPages = useMemo(() => Math.ceil(belts.length / itemsPerPage) || 1, [belts, itemsPerPage])

  const paginationRange = useMemo(() => {
    const total = belts.length
    if (total === 0) return '0-0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, total)
    return `${start}-${end} of ${total}`
  }, [belts, page, itemsPerPage])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return belts.slice(start, start + itemsPerPage)
  }, [belts, page, itemsPerPage])

  const addRank = async () => {
    if (!selectedRank) {
      alert('Please Select Rank First')
      return
    }
    try {
      const response = await postSecure(SECURE_ENDPOINTS.CUSTOMER_BUILDER, {
        customer: contact.id,
        rank: selectedRank,
      })
      setBelts(prev => [response as Belt, ...prev])
      setSelectedRank(null)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteRank = async () => {
    if (!selectedBelt) return
    setLoading(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.CUSTOMER_BUILDER, selectedBelt.id)
      setBelts(prev => prev.filter(b => b.id !== selectedBelt.id))
      setDeletePopup(false)
      setSelectedBelt(null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      {deletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <p className="mb-4 font-medium">Are you sure you want to delete this rank?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setDeletePopup(false); setSelectedBelt(null) }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={deleteRank} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-lg font-bold">{contact ? `${contact.first_name}'s` : ''} Ranks</h1>
        <div className="flex gap-2 flex-wrap">
          <select
            className="border rounded px-3 py-2 bg-gray-50"
            value={selectedRank ?? ''}
            onChange={e => setSelectedRank(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select Ranks</option>
            {filteredRanks.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button onClick={addRank} className="bg-black text-white px-4 py-2 rounded text-sm">
            Add Rank
          </button>
        </div>
      </div>
      <hr className="mb-4" />

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Belt</th>
                <th className="px-4 py-3 font-semibold">Created at</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.rank.name}</td>
                  <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelectedBelt(item); setDeletePopup(true) }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pagedItems.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No Ranks Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {belts.length > 0 && (
        <div className="flex items-center justify-end gap-2 mt-3 text-sm">
          <span>Items per page:</span>
          <select className="border rounded px-2 py-1" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setPage(1) }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>{paginationRange}</span>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-40">{'<'}</button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-40">{'>'}</button>
        </div>
      )}
    </div>
  )
}
