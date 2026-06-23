'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

export function ProfileAddEdit() {
  const router = useRouter()
  const { isMemberLoggedIn, getUser } = useAuth()
  const { getSecure, putSecure } = useSecureCalls()

  const [id, setId] = useState<number | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [street, setStreet] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isMemberLoggedIn()) {
      router.push('/')
      return
    }
    const user = getUser()
    if (!user?.id) return

    getSecure<{ results: any[] }>(SECURE_ENDPOINTS.CUSTOMER, { id: user.id })
      .then(response => {
        const userData = (response as any)?.results
        if (userData?.length > 0) {
          setId(userData[0].id)
          setFirstName(userData[0].first_name ?? '')
          setLastName(userData[0].last_name ?? '')
          setPhone(userData[0].phone ?? '')
          setCity(userData[0].city ?? '')
          setStreet(userData[0].street ?? '')
          setZipcode(userData[0].zipcode ?? '')
          setEmail(userData[0].email ?? '')
        }
      })
      .catch(console.error)
  }, [])

  const handleUpdate = async () => {
    if (!phone || !city || !zipcode || !street) return
    setLoading(true)
    try {
      await putSecure(SECURE_ENDPOINTS.CUSTOMER, {
        id, first_name: firstName, last_name: lastName,
        street, zipcode, city, phone, email,
      })
    } catch { /* handled by apiClient */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm">
        <div className="px-4 py-3 border-b">
          <h2 className="text-xl font-bold">{firstName} {lastName}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={city}
              onChange={e => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ZIP</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={zipcode}
              onChange={e => setZipcode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={street}
              onChange={e => setStreet(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-[#0c3cac] text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-[#d90000] text-white px-6 py-2 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
