'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface EventAddEditProps {
  eventId?: string
}

export function EventAddEdit({ eventId }: EventAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const location = useOrgStore(s => s.location)
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !eventId || eventId === 'new'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', start_datetime: '', end_datetime: '',
    price: '', member_price: '', capacity: '', location: location?.id ?? 0,
  })

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (!isNew) fetchEvent()
  }, [])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.EVENTS, { id: eventId })
      const data = Array.isArray(res) ? res[0] : res
      if (data) {
        setForm({
          name: data.name ?? '', description: data.description ?? '',
          start_datetime: data.start_datetime ?? '', end_datetime: data.end_datetime ?? '',
          price: data.price ?? '', member_price: data.member_price ?? '',
          capacity: data.capacity ?? '', location: data.location ?? location?.id ?? 0,
        })
      }
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.EVENTS, form)
      } else {
        await putSecure(SECURE_ENDPOINTS.EVENTS, { id: Number(eventId), ...form })
      }
      router.push('/admin/events')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">{isNew ? 'Add Event' : 'Edit Event'}</h2>
        {['name', 'description', 'price', 'member_price', 'capacity'].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">{field.replace('_', ' ')}</label>
            <input type={['price', 'member_price', 'capacity'].includes(field) ? 'number' : 'text'}
              className="w-full border rounded px-3 py-2"
              value={(form as any)[field]} onChange={e => updateField(field, e.target.value)} />
          </div>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date/Time</label>
            <input type="datetime-local" className="w-full border rounded px-3 py-2"
              value={form.start_datetime} onChange={e => updateField('start_datetime', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date/Time</label>
            <input type="datetime-local" className="w-full border rounded px-3 py-2"
              value={form.end_datetime} onChange={e => updateField('end_datetime', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isNew ? 'Create' : 'Update'}
          </button>
          <button onClick={() => router.push('/admin/events')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
