'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { apiClient } from '@/lib/api/fetchClient'

interface Agreement {
  id: number
  contact: { first_name: string; last_name: string; birthday?: string }
  agreement: { name: string; content: string }
  status: string | null
  updated_at: string
  pdf_uuid?: string
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours() % 12 || 12).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM'
    return `${yyyy}-${mm}-${dd} - (${hh}:${min} ${ampm})`
  } catch {
    return dateStr
  }
}

export function AgreementList() {
  const orgId = useOrgStore((s) => s.organization?.id)
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.get<Agreement[]>('/customer/agreement/', {
          params: { organization_id: orgId },
        })
        setAgreements(data ?? [])
      } catch {
        console.error('Error loading agreements')
      } finally {
        setLoading(false)
      }
    }
    if (orgId) load()
  }, [orgId])

  if (loading) {
    return (
      <div className="bg-[#f3f3f3] py-10 text-center">
        <p className="text-gray-500">Loading agreements...</p>
      </div>
    )
  }

  if (!agreements.length) {
    return (
      <div className="bg-[#f3f3f3] py-10 text-center">
        <p className="text-gray-500">No agreements found.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#f3f3f3] py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold">Contact Name</th>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Last Updated</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {agreements.map((ag) => (
                <tr key={ag.id} className="border-b hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    {ag.contact.first_name} {ag.contact.last_name}
                  </td>
                  <td className="px-4 py-3">{ag.agreement.name}</td>
                  <td className="px-4 py-3">{formatDate(ag.updated_at)}</td>
                  <td className="px-4 py-3 capitalize">{ag.status || 'unsigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
