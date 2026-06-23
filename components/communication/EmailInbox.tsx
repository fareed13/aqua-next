'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  first_name: string
  last_name: string
}

interface EmailItem {
  id: number
  contact?: Contact
  body: string
  subject: string
  type: string
  sent_by_location: boolean
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100, -1]

export default function EmailInbox() {
  const { getSecure, secureEndpoint } = useSecureCalls()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [fromLocation, setFromLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState<EmailItem[]>([])

  useEffect(() => {
    fetchEmails()
  }, [fromLocation])

  async function fetchEmails() {
    try {
      setLoading(true)
      const params: Record<string, any> = {}
      if (fromLocation) params.sent_by_location = true
      const data = await getSecure(secureEndpoint.COMMUNICATION, params)
      setEmails(Array.isArray(data) ? data : [])
    } catch {
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEmails = useMemo(() => {
    if (!search.trim()) return emails
    const term = search.toLowerCase()
    return emails.filter((e) => {
      const name = `${e.contact?.first_name ?? ''} ${e.contact?.last_name ?? ''}`.toLowerCase()
      return (
        name.includes(term) ||
        (e.subject ?? '').toLowerCase().includes(term) ||
        (e.type ?? '').toLowerCase().includes(term) ||
        (e.body ?? '').toLowerCase().includes(term)
      )
    })
  }, [emails, search])

  const effectiveItemsPerPage = itemsPerPage === -1 ? filteredEmails.length || 1 : itemsPerPage
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredEmails.length / itemsPerPage)

  const paginationRange = useMemo(() => {
    const total = filteredEmails.length
    if (total === 0) return '0-0 of 0'
    if (itemsPerPage === -1) return `1-${total} of ${total}`
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, total)
    return `${start}-${end} of ${total}`
  }, [filteredEmails.length, page, itemsPerPage])

  const pagedItems = useMemo(() => {
    if (itemsPerPage === -1) return filteredEmails
    const start = (page - 1) * itemsPerPage
    return filteredEmails.slice(start, start + itemsPerPage)
  }, [filteredEmails, page, itemsPerPage])

  function handleSearchChange(val: string) {
    setSearch(val)
    setPage(1)
  }

  function handleFromLocationChange() {
    setFromLocation((prev) => !prev)
    setPage(1)
  }

  const headers = [
    { label: 'Customer', key: 'full_name' },
    { label: 'Body', key: 'body' },
    { label: 'Subject', key: 'subject' },
    { label: 'Type', key: 'type' },
    { label: 'Direction', key: 'sent_by_location' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#124e66] p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <span className="text-white text-3xl mr-3">📧</span>
            <div>
              <h1 className="text-xl text-white font-semibold mb-1">Email</h1>
              <p className="text-sm text-white/70">View and filter Email communications</p>
            </div>
          </div>
          <div className="w-full md:w-72">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search Email..."
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        {/* Filter */}
        <div className="mb-6 flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={handleFromLocationChange}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${fromLocation ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${fromLocation ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-gray-700">Sent from location...</span>
          </label>
        </div>

        {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}

        {/* Desktop Table */}
        {!loading && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 rounded shadow-sm text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                <tr>
                  {headers.map((h) => (
                    <th key={h.key} className="px-4 py-3 border-b">{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="text-center text-gray-500 py-10">No Email Found</td>
                  </tr>
                ) : (
                  pagedItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.contact ? `${item.contact.first_name} ${item.contact.last_name}` : ''}</td>
                      <td className="px-4 py-2">
                        <span dangerouslySetInnerHTML={{ __html: item.body }} />
                      </td>
                      <td className="px-4 py-2">{item.subject}</td>
                      <td className="px-4 py-2">{item.type}</td>
                      <td className="px-4 py-2 text-xl">
                        {item.sent_by_location
                          ? <span style={{ color: '#4caf50' }}>↗</span>
                          : <span style={{ color: '#ff9800' }}>↙</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && (
          <div className="md:hidden">
            {pagedItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-semibold text-gray-500">No Email Found</p>
                <p className="text-sm text-gray-400">No Email found matching your filters or search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-4">
                {pagedItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded p-4 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span>👤</span>
                      <span>{item.contact ? `${item.contact.first_name} ${item.contact.last_name}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span>📧</span>
                      <span>{item.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span>🔷</span>
                      <span>{item.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span>📝</span>
                      <span dangerouslySetInnerHTML={{ __html: item.body }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredEmails.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1) }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {ITEMS_PER_PAGE_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v === -1 ? 'All' : v}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{paginationRange}</span>
              <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 disabled:opacity-40">⏮</button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 disabled:opacity-40">‹</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 disabled:opacity-40">›</button>
              <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 disabled:opacity-40">⏭</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
