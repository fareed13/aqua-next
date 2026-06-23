'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  id: number
  first_name: string
  [key: string]: unknown
}

interface Schedule {
  name: string
  pretty_start_time: string
  pretty_end_time: string
}

interface ReservedClass {
  id: number
  schedule: Schedule
  class_date: string
  [key: string]: unknown
}

interface CustomerClassesProps {
  contact: Contact
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const pad = (n: number) => String(n).padStart(2, '0')
    const day = days[d.getDay()]
    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const date = pad(d.getDate())
    return `${day} - ${year}/${month}/${date}`
  } catch {
    return dateStr
  }
}

export function CustomerClasses({ contact }: CustomerClassesProps) {
  const { getSecure, deleteSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [reservedClasses, setReservedClasses] = useState<ReservedClass[]>([])
  const [deletePopup, setDeletePopup] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ReservedClass | null>(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getSecure<any>(SECURE_ENDPOINTS.RESERVED_SCHEDULE, { contact_id: contact.id })
        setReservedClasses(Array.isArray(res) ? res : res?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contact.id])

  const totalPages = useMemo(() => Math.ceil(reservedClasses.length / itemsPerPage) || 1, [reservedClasses, itemsPerPage])

  const paginationRange = useMemo(() => {
    const total = reservedClasses.length
    if (total === 0) return '0-0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, total)
    return `${start}-${end} of ${total}`
  }, [reservedClasses, page, itemsPerPage])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return reservedClasses.slice(start, start + itemsPerPage)
  }, [reservedClasses, page, itemsPerPage])

  const deleteReserveClass = async () => {
    if (!selectedClass) return
    setLoading(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.RESERVED_SCHEDULE, selectedClass.id)
      setReservedClasses(prev => prev.filter(c => c.id !== selectedClass.id))
      setDeletePopup(false)
      setSelectedClass(null)
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
            <p className="mb-4 font-medium">Are you sure you want to delete this class reservation?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setDeletePopup(false); setSelectedClass(null) }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={deleteReserveClass} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h1 className="text-lg font-bold">{contact ? `${contact.first_name}'s` : ''} Classes</h1>
      </div>
      <hr className="mb-4 mt-8" />

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Class Name</th>
                <th className="px-4 py-3 font-semibold">Class Date</th>
                <th className="px-4 py-3 font-semibold">Class Timing</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.schedule.name}</td>
                  <td className="px-4 py-3">{formatDate(item.class_date)}</td>
                  <td className="px-4 py-3">{item.schedule.pretty_start_time} to {item.schedule.pretty_end_time}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelectedClass(item); setDeletePopup(true) }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pagedItems.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No Classes Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {reservedClasses.length > 0 && (
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
