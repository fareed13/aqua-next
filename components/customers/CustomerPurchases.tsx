'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Contact {
  id: number
  first_name: string
  [key: string]: unknown
}

interface Purchase {
  id: number
  plan: { name: string }
  created_at: string
  price_charged: number | string
  [key: string]: unknown
}

interface CustomerPurchasesProps {
  contact: Contact
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
    return `${year}-${month}-${day} ${h12}:${mins} ${ampm}`
  } catch {
    return dateStr
  }
}

export function CustomerPurchases({ contact }: CustomerPurchasesProps) {
  const { getSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [contactPurchases, setContactPurchases] = useState<Purchase[]>([])
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getSecure<any>(SECURE_ENDPOINTS.PLAN_PURCHASED, { contact: contact.id })
        setContactPurchases(Array.isArray(res) ? res : res?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [contact.id])

  const totalPages = useMemo(() => Math.ceil(contactPurchases.length / itemsPerPage) || 1, [contactPurchases, itemsPerPage])

  const paginationRange = useMemo(() => {
    const total = contactPurchases.length
    if (total === 0) return '0-0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, total)
    return `${start}-${end} of ${total}`
  }, [contactPurchases, page, itemsPerPage])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return contactPurchases.slice(start, start + itemsPerPage)
  }, [contactPurchases, page, itemsPerPage])

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold">{contact ? `${contact.first_name}'s` : ''} Purchases</h1>
      </div>
      <hr className="mb-4 mt-8" />

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Plan name</th>
                <th className="px-4 py-3 font-semibold">Purchased Date</th>
                <th className="px-4 py-3 font-semibold">Price Charged</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.plan.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3">$ {item.price_charged}</td>
                </tr>
              ))}
              {pagedItems.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No Purchases Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {contactPurchases.length > 0 && (
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
