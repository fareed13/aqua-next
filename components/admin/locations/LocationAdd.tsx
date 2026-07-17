'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface StateOption { id: number; name: string }

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

/** Add a new location (core create fields → POST LOCATION). Mirrors Nuxt LocationAdd.vue's payload. */
export function LocationAdd({
  open,
  states,
  onClose,
  onCreated,
}: {
  open: boolean
  states: StateOption[]
  onClose: () => void
  onCreated: () => void
}) {
  const organization = useOrgStore((s) => s.organization)
  const { postSecure } = useSecureCalls()

  const [state, setState] = useState<number | ''>('')
  const [schoolType, setSchoolType] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const create = async () => {
    if (!street.trim() || !city.trim() || !phone.trim() || !email.trim()) {
      toast.error('Please fill out the required fields', { duration: 10000 })
      return
    }
    setSaving(true)
    try {
      await postSecure(SECURE_ENDPOINTS.LOCATION, {
        state: state || null,
        school_type: schoolType,
        street,
        city,
        email,
        zip_code: zip,
        phone,
        organization: organization?.id,
      })
      toast.success('Location Added Successfully', { duration: 15000 })
      onCreated()
      onClose()
    } catch {
      toast.error('Location could not be added', { duration: 15000 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between bg-[#124e66] px-5 py-3 text-white">
          <h3 className="text-lg font-medium">Add Location</h3>
          <button onClick={onClose} aria-label="Close"><X size={22} /></button>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 md:grid-cols-2">
          <div>
            <label className={LABEL}>State</label>
            <select className={FIELD} value={state} onChange={(e) => setState(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select State</option>
              {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>School Type</label>
            <input className={FIELD} value={schoolType} onChange={(e) => setSchoolType(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Street *</label>
            <input className={FIELD} value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>City *</label>
            <input className={FIELD} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Zip</label>
            <input className={FIELD} value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Phone *</label>
            <input className={FIELD} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={LABEL}>Email *</label>
            <input className={FIELD} value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <button onClick={create} disabled={saving} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50">
            {saving ? 'Adding…' : 'Add Location'}
          </button>
          <button onClick={onClose} disabled={saving} className="rounded bg-gray-200 px-6 py-2.5 font-medium text-gray-700 disabled:opacity-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
