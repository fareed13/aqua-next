'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface CustomerAddEditProps {
  contactId?: string
  spam?: string | null
}

export function CustomerAddEdit({ contactId, spam }: CustomerAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, putSecure, postSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('details')
  const [contact, setContact] = useState<any>(null)

  const isNew = !contactId || contactId === 'new'

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    city: '', street: '', zipcode: '',
  })

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/'); return }
    if (!isNew) fetchContact()
  }, [])

  const fetchContact = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getSecure<{ results: any[] }>(SECURE_ENDPOINTS.CUSTOMER, { id: contactId })
      const data = (response as any)?.results?.[0]
      if (data) {
        setContact(data)
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          city: data.city ?? '',
          street: data.street ?? '',
          zipcode: data.zipcode ?? '',
        })
      }
    } catch { /* handled */ }
    finally { setLoading(false) }
  }, [contactId, getSecure])

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.CUSTOMER_CREATE, form)
      } else {
        await putSecure(SECURE_ENDPOINTS.CUSTOMER, { id: contactId, ...form })
      }
      router.push('/customers')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const tabs = isNew
    ? ['details']
    : ['details', 'belts', 'agreements', 'notes', 'classes', 'attendance', 'purchases', 'emergencyContacts', 'communication']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tabs */}
      {!isNew && (
        <div className="flex gap-1 mb-6 overflow-x-auto border-b">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 capitalize whitespace-nowrap text-sm font-medium border-b-2 ${
                tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'emergencyContacts' ? 'Emergency Contacts' : t}
            </button>
          ))}
        </div>
      )}

      {/* Details tab */}
      {tab === 'details' && (
        <div className="bg-white border rounded shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">{isNew ? 'Add Contact' : 'Edit Contact'}</h2>
          {['first_name', 'last_name', 'email', 'phone', 'city', 'street', 'zipcode'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field.replace('_', ' ')}
              </label>
              <input
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                className="w-full border rounded px-3 py-2"
                value={(form as any)[field]}
                onChange={e => updateField(field, e.target.value)}
              />
            </div>
          ))}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : isNew ? 'Create' : 'Update'}
            </button>
            <button
              onClick={() => router.push('/customers')}
              className="bg-gray-500 text-white px-6 py-2 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {tab !== 'details' && (
        <div className="bg-white border rounded shadow-sm p-6">
          <p className="text-gray-500 capitalize">{tab} tab content will be loaded here.</p>
        </div>
      )}
    </div>
  )
}
