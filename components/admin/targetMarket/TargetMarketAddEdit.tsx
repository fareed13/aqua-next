'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Check, Save, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { MultiSelectChips } from '@/components/customers/MultiSelectChips'

/** An interest/targeting option — persisted as an object (matches Nuxt `return-object`). */
export interface Interest {
  id: number
  name: string
}

/** A family-status option coming from FAMILY_STATUS. */
export interface FamilyStatusOption {
  id: number
  name: string
}

/** A target audience record from AUDIENCE (/ads/target-audience/). */
// The API returns chip fields (esp. interests) as EITHER an array OR an object map keyed by id.
// React's .map()/array ops throw on objects, so normalize to an array everywhere.
function toArr<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[]
  if (v && typeof v === 'object') return Object.values(v as Record<string, T>)
  return []
}

export interface Audience {
  id: number
  name: string
  service: { id: number; name: string } | null
  miles_radius: number | null
  min_age: number | null
  max_age: number | null
  genders: string[] | null
  education_statuses: string[] | null
  family_statuses: number[] | null
  interests: Interest[]
  is_global?: boolean
}

export interface TargetMarketAddEditProps {
  /** Audience id to edit; omit/null for "Add" mode. Accepts string (route slug) or number. */
  audienceId?: string | number | null
  /**
   * Set when hosted inside FbAdBuilder (Nuxt `from_builder`). Marks the component as
   * embedded so it never routes away on save/cancel/error.
   */
  fromBuilder?: boolean
  /**
   * Called after a successful create/update (Nuxt `updateAuddience`). Receives the created
   * record on create, `undefined` on update. When provided the component returns to the
   * caller instead of routing to /admin/all-settings.
   */
  onSaved?: (audience?: Audience) => void
  /** Called when the user cancels while embedded. Falls back to routing when omitted. */
  onCancel?: () => void
}

// Nuxt marks the audience "global" when its service is the reserved global service (id 188).
const GLOBAL_SERVICE_ID = 188

const GENDER_OPTIONS = [
  { name: 'Male', value: '1' },
  { name: 'Female', value: '2' },
]

const EDUCATION_OPTIONS = [
  { name: 'High School', value: '1' },
  { name: 'Undergraduate', value: '2' },
  { name: 'Alumni', value: '3' },
  { name: 'High School Graduate', value: '4' },
  { name: 'Some College', value: '5' },
  { name: 'Associate Degree', value: '6' },
  { name: 'In Graduation School', value: '7' },
  { name: 'Some Graduation School', value: '8' },
  { name: 'Master Degree', value: '9' },
  { name: 'Professional Degree', value: '10' },
  { name: 'Doctorate Degree', value: '11' },
  { name: 'Unspecified', value: '12' },
  { name: 'Some High School', value: '13' },
]

const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'
const FIELD =
  'w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'

export function TargetMarketAddEdit({
  audienceId,
  fromBuilder = false,
  onSaved,
  onCancel,
}: TargetMarketAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const services = useOrgServices()
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const embedded = fromBuilder || !!onSaved || !!onCancel
  const editMode = audienceId != null && audienceId !== ''

  const [overlay, setOverlay] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [milesRadius, setMilesRadius] = useState<number | ''>('')
  const [minAge, setMinAge] = useState<number | ''>('')
  const [maxAge, setMaxAge] = useState<number | ''>('')
  const [genders, setGenders] = useState<string[]>([])
  const [educationStatuses, setEducationStatuses] = useState<string[]>([])
  const [familyStatuses, setFamilyStatuses] = useState<number[]>([])
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([])
  const [serviceId, setServiceId] = useState<number | ''>('')
  const [isGlobal, setIsGlobal] = useState(false)

  const [familyStatusOptions, setFamilyStatusOptions] = useState<FamilyStatusOption[]>([])
  const [interests, setInterests] = useState<Interest[]>([])

  const init = async () => {
    try {
      setOverlay(true)
      const [fsRes, intRes] = await Promise.all([
        getSecure<FamilyStatusOption[]>(SECURE_ENDPOINTS.FAMILY_STATUS),
        getSecure<Interest[]>(SECURE_ENDPOINTS.INTERESTS),
      ])
      setFamilyStatusOptions(Array.isArray(fsRes) ? fsRes : [])
      setInterests(Array.isArray(intRes) ? intRes : [])

      if (editMode) {
        const res = await getSecure<Audience[]>(SECURE_ENDPOINTS.AUDIENCE, {
          id: String(audienceId),
        })
        const a = Array.isArray(res) ? res[0] : (res as Audience | undefined)
        if (a) {
          setId(a.id)
          setName(a.name ?? '')
          setMilesRadius(a.miles_radius ?? '')
          setMinAge(a.min_age ?? '')
          setMaxAge(a.max_age ?? '')
          setGenders(toArr<string>(a.genders))
          setEducationStatuses(toArr<string>(a.education_statuses))
          setFamilyStatuses(toArr<number>(a.family_statuses))
          setSelectedInterests(toArr<Interest>(a.interests))
          const svcId = a.service ? a.service.id : null
          setServiceId(svcId ?? '')
          setIsGlobal(svcId === GLOBAL_SERVICE_ID)
        }
      }
    } catch (err) {
      console.error(err)
      if (!embedded) router.push('/admin/all-settings')
    } finally {
      setOverlay(false)
    }
  }

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      if (!embedded) router.push('/login')
      return
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceId])

  const validate = (): boolean => {
    if (!name.trim()) return false
    if (!isGlobal && !serviceId) return false
    return true
  }

  const buildPayload = () => ({
    name,
    miles_radius: milesRadius === '' ? null : milesRadius,
    min_age: minAge === '' ? null : minAge,
    max_age: maxAge === '' ? null : maxAge,
    genders,
    education_statuses: educationStatuses,
    family_statuses: familyStatuses,
    interests: selectedInterests,
    service_id: isGlobal ? null : serviceId === '' ? null : serviceId,
    is_global: isGlobal,
  })

  const finish = (created?: Audience) => {
    if (onSaved) onSaved(created)
    else router.push('/admin/all-settings')
  }

  const create = async () => {
    if (!validate()) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }
    try {
      setOverlay(true)
      const created = await postSecure<Audience>(SECURE_ENDPOINTS.AUDIENCE, buildPayload())
      toast.success('Audience created successfully', { duration: 15000 })
      finish(created)
    } catch {
      if (!embedded) router.push('/admin/all-settings')
    } finally {
      setOverlay(false)
    }
  }

  const update = async () => {
    if (!validate()) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }
    try {
      setOverlay(true)
      await putSecure(SECURE_ENDPOINTS.AUDIENCE, { id, ...buildPayload() })
      toast.success('Audience Updated successfully', { duration: 15000 })
      finish()
    } catch {
      if (!embedded) router.push('/admin/all-settings')
    } finally {
      setOverlay(false)
    }
  }

  const cancel = () => {
    if (onCancel) onCancel()
    else router.push('/admin/all-settings')
  }

  return (
    <div className={embedded ? 'p-4' : 'mx-auto max-w-4xl px-4 py-8'}>
      {overlay && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-6 py-4 font-semibold text-gray-800">
          <FileText size={20} className="text-[#124e66]" />
          Target Market {editMode ? 'Edit' : 'Add'}
        </div>

        <div className="space-y-5 p-6">
          {/* Basic information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={FIELD}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Radius (miles)</label>
              <input
                type="number"
                className={FIELD}
                value={milesRadius}
                onChange={(e) => setMilesRadius(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          {/* Age range */}
          <div>
            <label className={LABEL}>Age Range</label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="number"
                min={18}
                max={65}
                placeholder="Minimum Age"
                className={FIELD}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <input
                type="number"
                min={18}
                max={65}
                placeholder="Maximum Age"
                className={FIELD}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChipMultiSelect
              label="Genders"
              options={GENDER_OPTIONS}
              selected={genders}
              onToggle={(v) =>
                setGenders((prev) =>
                  prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                )
              }
            />
            <ChipMultiSelect
              label="Educations"
              options={EDUCATION_OPTIONS}
              selected={educationStatuses}
              onToggle={(v) =>
                setEducationStatuses((prev) =>
                  prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                )
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL}>Family Statuses</label>
              <MultiSelectChips
                options={familyStatusOptions}
                value={familyStatuses}
                onChange={setFamilyStatuses}
                placeholder="Select family statuses"
              />
            </div>
            <div>
              <label className={LABEL}>Targeting Interests</label>
              <SearchableInterestSelect
                options={interests}
                selected={selectedInterests}
                onChange={setSelectedInterests}
              />
            </div>
          </div>

          {/* Service + global switch */}
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
            {!isGlobal && (
              <div>
                <label className={LABEL}>
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  className={FIELD}
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-2 py-2">
              <button
                type="button"
                role="switch"
                aria-checked={isGlobal}
                onClick={() => {
                  setIsGlobal((g) => {
                    if (!g) setServiceId('')
                    return !g
                  })
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isGlobal ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    isGlobal ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">Is Global?</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={editMode ? update : create}
              disabled={overlay}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1565C0] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#0d47a1] disabled:opacity-50"
            >
              <Save size={18} />
              {editMode ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-md bg-gray-200 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Short-list multi-select rendered as toggleable chips (genders, educations). */
function ChipMultiSelect({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: { name: string; value: string }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="flex min-h-[50px] flex-wrap gap-2 rounded-md border border-gray-300 bg-white p-2">
        {options.map((opt) => {
          const active = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[13px] transition-colors ${
                active
                  ? 'border-[#1565C0] bg-[#1565C0] text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-[#1565C0]'
              }`}
            >
              {active && <Check size={12} />}
              {opt.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Searchable multi-select for interests (persisted as objects, matches Nuxt `return-object`). */
function SearchableInterestSelect({
  options,
  selected,
  onChange,
}: {
  options: Interest[]
  selected: Interest[]
  onChange: (next: Interest[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const toggle = (interest: Interest) => {
    if (selected.find((i) => i.id === interest.id)) {
      onChange(selected.filter((i) => i.id !== interest.id))
    } else {
      onChange([...selected, interest])
    }
  }

  const filtered = query
    ? options.filter((o) => o.name?.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[50px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-[15px]"
      >
        {selected.length === 0 && <span className="text-gray-400">Select interests</span>}
        {selected.map((o) => (
          <span
            key={o.id}
            className="inline-flex items-center gap-1 rounded-full bg-[#e6edfd] px-2.5 py-0.5 text-[13px] text-[#2a4d9b]"
          >
            {o.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggle(o)
              }}
              aria-label={`Remove ${o.name}`}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search interests..."
              className="w-full text-sm outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">No interests</p>
            )}
            {filtered.map((o) => {
              const active = !!selected.find((i) => i.id === o.id)
              return (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[15px] hover:bg-[#eef2fb]"
                >
                  <input type="checkbox" checked={active} onChange={() => toggle(o)} />
                  {o.name}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
