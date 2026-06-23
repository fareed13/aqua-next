'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

export function BookedAppointments() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure } = useSecureCalls()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.BOOKED_APPOINTMENTS)
      setAppointments(res ?? [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No booked appointments found</div>
      ) : (
        <div className="bg-white border rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-sm font-semibold">Time</th>
                <th className="px-4 py-3 text-sm font-semibold">Service</th>
                <th className="px-4 py-3 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, i) => (
                <tr key={apt.id ?? i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{apt.contact_name ?? apt.name ?? '-'}</td>
                  <td className="px-4 py-3">{apt.date ?? '-'}</td>
                  <td className="px-4 py-3">{apt.time ?? '-'}</td>
                  <td className="px-4 py-3">{apt.service ?? '-'}</td>
                  <td className="px-4 py-3">{apt.status ?? 'Booked'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
