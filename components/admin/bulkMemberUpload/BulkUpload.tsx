'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { UsersRound, CloudUpload, MapPin } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

function authHeader(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.split('; ').find((c) => c.startsWith('auth._token.local='))
  if (!match) return ''
  const raw = decodeURIComponent(match.split('=')[1] ?? '')
  return raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
}

/** Ports Nuxt bulkMemberUpload/BulkUpload.vue — CSV member bulk upload (multipart POST). */
export function BulkUpload() {
  const locations = useOrgStore((s) => s.locations) as unknown as Array<{ id: number; city: string; target_locations?: string[] }>
  const organization = useOrgStore((s) => s.organization)

  const [selectedLocation, setSelectedLocation] = useState<number | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [overlay, setOverlay] = useState(false)

  const title = (l: { city: string; target_locations?: string[] }) =>
    (l.target_locations && l.target_locations[0]) || l.city

  const upload = async () => {
    if (!selectedLocation || !file) {
      toast.error('Please select a CSV file', { duration: 5000 })
      return
    }
    setOverlay(true)
    try {
      const fd = new FormData()
      fd.append('location_id', String(selectedLocation))
      fd.append('file', file)
      const url = new URL(`${BACKEND_URL}${SECURE_ENDPOINTS.CUSTOMER_BULK_UPLOAD}`)
      if (organization?.id) url.searchParams.set('organization_id', String(organization.id))
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { Authorization: authHeader() },
        body: fd,
      })
      if (!res.ok) throw new Error(`Upload failed [${res.status}]`)
      toast.success('Members added Successfully', { duration: 10000 })
      setFile(null)
    } catch {
      toast.error('File can not be uploaded', { duration: 5000 })
    } finally {
      setOverlay(false)
    }
  }

  return (
    <div className="min-h-full bg-[#f8fafc]">
      {overlay && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/90">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      <div className="mb-8 bg-[#124e66] p-6">
        <h1 className="mb-2 flex items-center gap-3 text-xl font-medium text-white md:text-3xl">
          <UsersRound size={34} /> Upload Members
        </h1>
        <p className="text-white/75">Bulk upload member data using a CSV file</p>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-8">
        <div className="rounded-xl bg-white p-4 shadow md:p-8">
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Select Location</label>
            <div className="relative">
              <MapPin size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base focus:border-[#124e66] focus:outline-none"
              >
                <option value="">Select Location</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{title(l)}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Choose a CSV file</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-base file:mr-3 file:rounded file:border-0 file:bg-[#124e66] file:px-3 file:py-1.5 file:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">Required format: email, firstName, lastName, phone, street, zipcode, city</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={upload}
              disabled={!selectedLocation || !file || overlay}
              className="flex items-center gap-2 rounded bg-[#124E66] px-6 py-2.5 font-medium text-white disabled:opacity-50"
            >
              <CloudUpload size={18} /> Upload Members
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
