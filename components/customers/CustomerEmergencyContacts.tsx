'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  id: number
  first_name: string
  last_name: string
  email?: string
  [key: string]: unknown
}

interface EmergencyContact {
  id: number
  emergency_contact: {
    id: number
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  relationship?: string
  [key: string]: unknown
}

interface CustomerEmergencyContactsProps {
  contact: Contact
  allContacts?: Contact[]
}

const RELATION_CHOICES = [
  { text: 'Spouse', value: 'spouse' },
  { text: 'Parent', value: 'parent' },
  { text: 'Friend', value: 'friend' },
  { text: 'Other', value: 'other' },
]

export function CustomerEmergencyContacts({ contact, allContacts = [] }: CustomerEmergencyContactsProps) {
  const { getSecure, postSecure, deleteSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [customerEmergencyContacts, setCustomerEmergencyContacts] = useState<EmergencyContact[]>([])
  const [emergencyContact, setEmergencyContact] = useState<number | null>(null)
  const [selectedRelationship, setSelectedRelationship] = useState('')
  const [deletePopup, setDeletePopup] = useState(false)
  const [selectedEcToDelete, setSelectedEcToDelete] = useState<EmergencyContact | null>(null)
  const [contactSearch, setContactSearch] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getSecure<any>(SECURE_ENDPOINTS.CUSTOMER_CONTACT, { contact: contact.id })
        setCustomerEmergencyContacts(Array.isArray(res) ? res : res?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contact.id])

  const filteredContacts = useMemo(() => {
    return allContacts
      .filter(c => c.email != null)
      .sort((a, b) => a.first_name.localeCompare(b.first_name))
  }, [allContacts])

  const searchedContacts = useMemo(() => {
    if (!contactSearch) return filteredContacts
    const q = contactSearch.toLowerCase()
    return filteredContacts.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
    )
  }, [filteredContacts, contactSearch])

  const totalPages = useMemo(
    () => Math.ceil(customerEmergencyContacts.length / itemsPerPage) || 1,
    [customerEmergencyContacts, itemsPerPage]
  )

  const paginationRange = useMemo(() => {
    const total = customerEmergencyContacts.length
    if (total === 0) return '0-0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, total)
    return `${start}-${end} of ${total}`
  }, [customerEmergencyContacts, page, itemsPerPage])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return customerEmergencyContacts.slice(start, start + itemsPerPage)
  }, [customerEmergencyContacts, page, itemsPerPage])

  const addEmergencyContact = async () => {
    if (!emergencyContact) {
      alert('Please Select a Contact.')
      return
    }
    if (!selectedRelationship) {
      alert('Please Select Relationship.')
      return
    }
    const found = customerEmergencyContacts.some(ec => ec.emergency_contact.id === emergencyContact)
    if (found) {
      alert('Emergency Contact already exists')
      return
    }
    try {
      const response = await postSecure(SECURE_ENDPOINTS.CUSTOMER_CONTACT, {
        customer: contact.id,
        emergency_contact: emergencyContact,
        relationship: selectedRelationship,
      }) as EmergencyContact
      setCustomerEmergencyContacts(prev => [response, ...prev])
      setEmergencyContact(null)
      setSelectedRelationship('')
      setContactSearch('')
    } catch (error) {
      console.error(error)
    }
  }

  const deleteEmergencyContact = async () => {
    if (!selectedEcToDelete) return
    try {
      await deleteSecure(SECURE_ENDPOINTS.CUSTOMER_CONTACT, selectedEcToDelete.id)
      setCustomerEmergencyContacts(prev => prev.filter(ec => ec.id !== selectedEcToDelete.id))
      setDeletePopup(false)
      setSelectedEcToDelete(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-4">
      {deletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <p className="mb-4 font-medium">Are you sure you want to delete this emergency contact?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setDeletePopup(false); setSelectedEcToDelete(null) }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={deleteEmergencyContact} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-lg font-bold">Add Emergency Contact</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Search contacts..."
              className="border rounded px-3 py-2 text-sm bg-gray-50 w-48"
              value={contactSearch}
              onChange={e => setContactSearch(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2 bg-gray-50 w-48"
              value={emergencyContact ?? ''}
              onChange={e => setEmergencyContact(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Choose a contact</option>
              {searchedContacts.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
          <select
            className="border rounded px-3 py-2 bg-gray-50 w-48"
            value={selectedRelationship}
            onChange={e => setSelectedRelationship(e.target.value)}
          >
            <option value="">Select Relationship</option>
            {RELATION_CHOICES.map(r => <option key={r.value} value={r.value}>{r.text}</option>)}
          </select>
          <button onClick={addEmergencyContact} className="bg-black text-white px-4 py-2 rounded text-sm whitespace-nowrap">
            Add Emergency Contact
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
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Relation</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.emergency_contact.first_name} {item.emergency_contact.last_name}</td>
                  <td className="px-4 py-3">{item.emergency_contact.email ?? ''}</td>
                  <td className="px-4 py-3">{item.emergency_contact.phone ?? ''}</td>
                  <td className="px-4 py-3">{item.relationship ?? ''}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelectedEcToDelete(item); setDeletePopup(true) }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pagedItems.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No Emergency Contacts Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {customerEmergencyContacts.length > 0 && (
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
