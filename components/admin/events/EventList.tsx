'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

export function EventList() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, deleteSecure } = useSecureCalls()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.EVENTS)
      setEvents(res ?? [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteSecure(SECURE_ENDPOINTS.EVENTS, id)
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch { /* handled */ }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Events</h2>
        <button onClick={() => router.push('/admin/events/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">
          + Add Event
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No events found</div>
      ) : (
        <div className="bg-white border rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-sm font-semibold">Start</th>
                <th className="px-4 py-3 text-sm font-semibold">End</th>
                <th className="px-4 py-3 text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(evt => (
                <tr key={evt.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{evt.name}</td>
                  <td className="px-4 py-3">{evt.start_datetime ? new Date(evt.start_datetime).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">{evt.end_datetime ? new Date(evt.end_datetime).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">${evt.price ?? '0'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => router.push(`/admin/events/${evt.id}`)}
                      className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(evt.id)}
                      className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
