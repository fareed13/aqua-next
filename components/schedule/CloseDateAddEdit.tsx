// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getDayName(dateStr: string) {
  if (!dateStr) return ''
  return DAYS[new Date(dateStr + 'T00:00:00').getDay()]
}

interface CloseDateAddEditProps {
  popup: boolean
  toggleCloseDatePopup: () => void
  selectedLocationId: number
}

export function CloseDateAddEdit({ popup, toggleCloseDatePopup, selectedLocationId }: CloseDateAddEditProps) {
  const { getSecure, postSecure, deleteSecure } = useSecureCalls()

  const [closeDates, setCloseDates] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (popup) fetchCloseDates()
  }, [popup])

  const fetchCloseDates = async () => {
    try {
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.CLOSED_DATE)
      setCloseDates((res ?? []).filter((d: any) => d.location === selectedLocationId))
    } catch { /* handled */ }
  }

  const isAquilaDate = (item: any) => String(item?.source ?? '').toLowerCase() === 'aquila'

  const handleAdd = async () => {
    if (!selectedDate) return
    if (closeDates.find(d => d.date_closed === selectedDate)) return
    setLoading(true)
    try {
      const res = await postSecure<any>(SECURE_ENDPOINTS.CLOSED_DATE, {
        location: selectedLocationId,
        date_closed: selectedDate,
      })
      setCloseDates(prev => [...prev, res])
      setSelectedDate('')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const handleDelete = async (item: any) => {
    if (isAquilaDate(item)) return
    try {
      await deleteSecure(SECURE_ENDPOINTS.CLOSED_DATE, { id: item.id })
      setCloseDates(prev => prev.filter(d => d.id !== item.id))
    } catch { /* handled */ }
  }

  if (!popup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold">Location Closed Date</h2>
            <button onClick={toggleCloseDatePopup} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">
              &times;
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Add dates for which the location is closed for business. Classes will not show on those dates.
          </p>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Date picker + Add */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Select Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={loading || !selectedDate}
              className="bg-red-600 text-white px-5 py-2 rounded font-semibold disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>

          <hr />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Date</th>
                  <th className="text-left px-3 py-2 font-semibold">Day</th>
                  <th className="text-left px-3 py-2 font-semibold">Source</th>
                  <th className="text-left px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {closeDates.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-4">No closed dates added yet</td></tr>
                )}
                {closeDates.map((item, i) => (
                  <tr key={item.id ?? i} className="border-t">
                    <td className="px-3 py-2">{formatDate(item.date_closed)}</td>
                    <td className="px-3 py-2">{getDayName(item.date_closed)}</td>
                    <td className="px-3 py-2">{item.source ?? '—'}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={isAquilaDate(item)}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                        title={isAquilaDate(item) ? 'Cannot delete Aquila dates' : 'Delete'}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
