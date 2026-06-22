'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  id: number
  first_name: string
  email: string
  phone: string
  [key: string]: unknown
}

interface Communication {
  id: number
  subject?: string
  body: string
  created_at: string
  type: string
  sent_by_location: boolean
  [key: string]: unknown
}

interface CustomerCommunicationProps {
  contact: Contact
  allContacts?: Contact[]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
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

const TYPE_CHOICES = [
  { text: 'Email', value: 'email' },
  { text: 'SMS', value: 'sms' },
]

const TYPE_CHOICES_FILTER = [
  { text: '---', value: '' },
  { text: 'Email', value: 'email' },
  { text: 'SMS', value: 'sms' },
]

export function CustomerCommunication({ contact, allContacts }: CustomerCommunicationProps) {
  const { getSecure, postSecure } = useSecureCalls()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [communications, setCommunications] = useState<Communication[]>([])
  const [dialog, setDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getSecure<any>(SECURE_ENDPOINTS.COMMUNICATION, { contact: contact.id })
        setCommunications(Array.isArray(res) ? res : res?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    const typeParam = searchParams.get('type')
    if (typeParam) setSelectedFilter(typeParam)
  }, [contact.id])

  const filteredCommunications = useMemo(() => {
    if (!selectedFilter) return communications
    return communications.filter(c => c.type === selectedFilter)
  }, [communications, selectedFilter])

  const totalPages = useMemo(
    () => Math.ceil(filteredCommunications.length / itemsPerPage) || 1,
    [filteredCommunications, itemsPerPage]
  )

  const paginationRange = useMemo(() => {
    const total = filteredCommunications.length
    if (total === 0) return '0-0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, total)
    return `${start}-${end} of ${total}`
  }, [filteredCommunications, page, itemsPerPage])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filteredCommunications.slice(start, start + itemsPerPage)
  }, [filteredCommunications, page, itemsPerPage])

  const onDialogClose = () => {
    setSelectedType('')
    setSubject('')
    setBody('')
    setSendingMessage(false)
  }

  const create = async () => {
    if (!selectedType) return
    if (selectedType === 'email' && !subject.trim()) {
      alert('Please fill out the required fields')
      return
    }
    if (!body.trim()) {
      alert('Please fill out the required fields')
      return
    }
    try {
      setSendingMessage(true)
      const response = await postSecure(SECURE_ENDPOINTS.COMMUNICATION, {
        subject: selectedType === 'email' ? subject : null,
        body,
        contact: contact.id,
        type: selectedType,
      }) as Communication
      setDialog(false)
      onDialogClose()
      setCommunications(prev => [response, ...prev])
    } catch (error) {
      console.error(error)
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-lg font-bold">Add Customer Communication</h1>
        <button
          onClick={() => setDialog(true)}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Send Message
        </button>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-xl mx-4">
            <h2 className="text-base font-semibold mb-4">Send Message</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Select Type</label>
              <select
                className="w-full md:w-64 border rounded px-3 py-2 bg-gray-50"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                <option value="">Select Type</option>
                {TYPE_CHOICES.map(t => (
                  <option key={t.value} value={t.value}>{t.text}</option>
                ))}
              </select>
            </div>

            {selectedType && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">To:</label>
                <input
                  type="text"
                  className="w-full md:w-64 border rounded px-3 py-2 bg-gray-100"
                  value={selectedType === 'email' ? contact.email : contact.phone}
                  readOnly
                  disabled
                />
              </div>
            )}

            {selectedType === 'email' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Subject *</label>
                <input
                  type="text"
                  className="w-full md:w-64 border rounded px-3 py-2 bg-gray-50"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>
            )}

            {selectedType && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Body *</label>
                <textarea
                  className="w-full border rounded px-3 py-2 bg-gray-50"
                  rows={8}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => { setDialog(false); onDialogClose() }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button
                onClick={create}
                disabled={!selectedType || sendingMessage}
                className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      <hr className="mb-4 mt-8" />

      <div className="mb-4">
        <select
          className="border rounded px-3 py-2 bg-gray-50 w-full md:w-64"
          value={selectedFilter}
          onChange={e => { setSelectedFilter(e.target.value); setPage(1) }}
        >
          {TYPE_CHOICES_FILTER.map(t => (
            <option key={t.value} value={t.value}>{t.text}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Body</th>
                <th className="px-4 py-3 font-semibold">Created at</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Direction</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.subject ?? ''}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <span dangerouslySetInnerHTML={{ __html: item.body }} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: item.sent_by_location ? '#4caf50' : '#ff9800', fontSize: 20 }}>
                      {item.sent_by_location ? '↗' : '↙'}
                    </span>
                  </td>
                </tr>
              ))}
              {pagedItems.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No Communications Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {filteredCommunications.length > 0 && (
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
