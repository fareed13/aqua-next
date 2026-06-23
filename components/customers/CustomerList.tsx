'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  is_spam?: boolean
  [key: string]: unknown
}

export function CustomerList() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, deleteSecure } = useSecureCalls()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSpam, setShowSpam] = useState(false)

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/')
      return
    }
    fetchContacts()
  }, [])

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getSecure<{ results: Contact[] }>(SECURE_ENDPOINTS.CUSTOMER)
      setContacts((response as any)?.results ?? [])
    } catch { /* handled by apiClient */ }
    finally { setLoading(false) }
  }, [getSecure])

  const filtered = contacts.filter(c => {
    const matchSearch = !search ||
      `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
    const matchSpam = showSpam ? c.is_spam : !c.is_spam
    return matchSearch && matchSpam
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setShowSpam(false)}
            className={`px-4 py-2 rounded ${!showSpam ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Contacts
          </button>
          <button
            onClick={() => setShowSpam(true)}
            className={`px-4 py-2 rounded ${showSpam ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Spam
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2 w-64"
            placeholder="Search Contacts"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => router.push('/customers/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          >
            + Add Contact
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white border rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-sm font-semibold">Phone</th>
                <th className="px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/customers/${c.id}`)}
                >
                  <td className="px-4 py-3">{c.first_name} {c.last_name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No contacts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
