'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useOrgStore } from '@/store/orgStore'

interface Contact {
  id: number
  first_name: string
  last_name: string
  birthday?: string
  [key: string]: unknown
}

interface Agreement {
  id: number
  name: string
  content?: string
  [key: string]: unknown
}

interface CustomerAgreement {
  id: number
  agreement: Agreement
  contact: Contact
  updated_at: string
  status?: string
  pdf_uuid?: string
  [key: string]: unknown
}

interface CustomerAgreementsProps {
  contact: Contact
}

function formatDate(dateStr: string, fmt: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    // Simple formatting
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

function diffInYears(from: Date, toStr: string): number {
  const to = new Date(toStr)
  return Math.floor((from.getTime() - to.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export function CustomerAgreements({ contact }: CustomerAgreementsProps) {
  const { getSecure, postSecure, deleteSecure, postSecureBuffer } = useSecureCalls() as any
  const orgStore = useOrgStore() as any

  const [loading, setLoading] = useState(false)
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [customerAgreements, setCustomerAgreements] = useState<CustomerAgreement[]>([])
  const [selectedAgreement, setSelectedAgreement] = useState<number | null>(null)
  const [deletePopup, setDeletePopup] = useState(false)
  const [selectedCusAgreement, setSelectedCusAgreement] = useState<CustomerAgreement | null>(null)
  const [showSignPopup, setShowSignPopup] = useState(false)
  const [agreementContent, setAgreementContent] = useState<string | null>(null)
  const [agreementId, setAgreementId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [agmts, custAgmts] = await Promise.all([
          getSecure(SECURE_ENDPOINTS.AGREEMENTS),
          getSecure(SECURE_ENDPOINTS.CUSTOMER_AGREEMENTS, { contact: contact.id }),
        ])
        setAgreements(Array.isArray(agmts) ? agmts : (agmts as any)?.results ?? [])
        setCustomerAgreements(Array.isArray(custAgmts) ? custAgmts : (custAgmts as any)?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contact.id])

  const filteredAgreements = useMemo(() => {
    if (customerAgreements.length === 0) return agreements
    return agreements.filter(a => !customerAgreements.some(ca => ca.agreement.id === a.id))
  }, [agreements, customerAgreements])

  const totalPages = useMemo(
    () => Math.ceil(customerAgreements.length / itemsPerPage) || 1,
    [customerAgreements, itemsPerPage]
  )

  const paginationRange = useMemo(() => {
    const total = customerAgreements.length
    if (total === 0) return '0-0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, total)
    return `${start}-${end} of ${total}`
  }, [customerAgreements, page, itemsPerPage])

  const pagedAgreements = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return customerAgreements.slice(start, start + itemsPerPage)
  }, [customerAgreements, page, itemsPerPage])

  const addAgreement = async () => {
    if (!selectedAgreement) {
      alert('Please Select Agreement First')
      return
    }
    const found = customerAgreements.some(el => el.agreement.id === selectedAgreement)
    if (found) {
      alert('Agreement already exists')
      return
    }
    try {
      const response = await postSecure(SECURE_ENDPOINTS.CUSTOMER_AGREEMENTS, {
        agreement: selectedAgreement,
        contact: contact.id,
      })
      setCustomerAgreements(prev => [response, ...prev])
      setSelectedAgreement(null)
    } catch (error) {
      console.error(error)
    }
  }

  const deleteAgreement = async () => {
    if (!selectedCusAgreement) return
    setLoading(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.CUSTOMER_AGREEMENTS, selectedCusAgreement.id)
      setCustomerAgreements(prev => prev.filter(a => a.id !== selectedCusAgreement.id))
      setDeletePopup(false)
      setSelectedCusAgreement(null)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const openAgreement = async (item: CustomerAgreement) => {
    if (item.status === 'signed') {
      try {
        const response = await postSecureBuffer(SECURE_ENDPOINTS.DOWNLOAD_AGREEMENT, {
          file_name: `${item.pdf_uuid}.pdf`,
        })
        const blob = new Blob([response], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
      } catch (err) {
        console.error(err)
      }
    } else {
      let content = item.agreement.content ?? ''
      content = content.replace(/#customerFirstName#/g, item.contact.first_name)
      content = content.replace(/#customerLastName#/g, item.contact.last_name)
      content = content.replace(/#organizationName#/g, orgStore?.organization?.name ?? '')
      content = content.replace(
        /#locationDomain#/g,
        (orgStore?.organization?.canonical_domain || orgStore?.domain || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
      )
      content = content.replace(/#street#/g, orgStore?.location?.street ?? '')
      content = content.replace(
        /#age#/g,
        item.contact.birthday ? String(diffInYears(new Date(), item.contact.birthday as string)) : ''
      )
      content = content.replace(/#currentDate#/g, formatDate(new Date().toISOString(), 'MM/DD/YYYY'))
      setAgreementContent(content)
      setAgreementId(item.id)
      setShowSignPopup(true)
    }
  }

  return (
    <div className="p-4">
      {deletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <p className="mb-4 font-medium">Are you sure you want to delete this agreement?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setDeletePopup(false); setSelectedCusAgreement(null) }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={deleteAgreement} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-lg font-bold">{contact ? `${contact.first_name}'s` : ''} Agreements</h1>
        <div className="flex gap-2 flex-wrap">
          <select
            className="border rounded px-3 py-2 bg-gray-50"
            value={selectedAgreement ?? ''}
            onChange={e => setSelectedAgreement(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select Agreement</option>
            {filteredAgreements.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button onClick={addAgreement} className="bg-black text-white px-4 py-2 rounded text-sm">
            Add Agreement
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
                <th className="px-4 py-3 font-semibold">Created at</th>
                <th className="px-4 py-3 font-semibold">Agreement</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedAgreements.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openAgreement(item)}>
                  <td className="px-4 py-3">{item.contact.first_name} {item.contact.last_name}</td>
                  <td className="px-4 py-3">{formatDate(item.updated_at, 'YYYY-MM-DD - (hh:mm A)')}</td>
                  <td className="px-4 py-3">{item.agreement.name}</td>
                  <td className="px-4 py-3">{item.status ?? 'unsigned'}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedCusAgreement(item); setDeletePopup(true) }}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pagedAgreements.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No Agreements Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {customerAgreements.length > 0 && (
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

      {showSignPopup && agreementContent && agreementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: agreementContent }} />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowSignPopup(false)} className="px-4 py-2 rounded bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
