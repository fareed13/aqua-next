'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface TargetMarketAddEditProps {
  audienceId?: string
}

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

export function TargetMarketAddEdit({ audienceId }: TargetMarketAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const services = useOrgStore(s => s.organization?.services ?? [])
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !audienceId
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    miles_radius: '' as number | '',
    min_age: '' as number | '',
    max_age: '' as number | '',
    genders: [] as string[],
    education_statuses: [] as string[],
    family_statuses: [] as number[],
    selectedInterests: [] as any[],
    service_id: '' as number | '',
    is_global: false,
  })
  const [familyStatusOptions, setFamilyStatusOptions] = useState<any[]>([])
  const [interests, setInterests] = useState<any[]>([])

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    init()
  }, [])

  const init = async () => {
    try {
      setLoading(true)
      const [fsRes, intRes] = await Promise.all([
        getSecure<any[]>(SECURE_ENDPOINTS.FAMILY_STATUS),
        getSecure<any[]>(SECURE_ENDPOINTS.INTERESTS),
      ])
      setFamilyStatusOptions(fsRes ?? [])
      setInterests(intRes ?? [])

      if (!isNew && audienceId) {
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.AUDIENCE, { id: audienceId })
        const a = Array.isArray(res) ? res[0] : res
        if (a) {
          setId(a.id)
          setForm({
            name: a.name ?? '',
            miles_radius: a.miles_radius ?? '',
            min_age: a.min_age ?? '',
            max_age: a.max_age ?? '',
            genders: a.genders ?? [],
            education_statuses: a.education_statuses ?? [],
            family_statuses: a.family_statuses ?? [],
            selectedInterests: Object.keys(a.interests ?? {}).length ? a.interests : [],
            service_id: a.service?.id ?? '',
            is_global: !a.service,
          })
        }
      }
    } catch { router.push('/admin/all-settings') }
    finally { setLoading(false) }
  }

  const toggleMulti = <T,>(field: keyof typeof form, value: T) => {
    setForm(prev => {
      const arr = prev[field] as T[]
      if (arr.includes(value)) return { ...prev, [field]: arr.filter(v => v !== value) }
      return { ...prev, [field]: [...arr, value] }
    })
  }

  const toggleInterest = (interest: any) => {
    setForm(prev => {
      const arr = prev.selectedInterests
      if (arr.find((i: any) => i.id === interest.id)) {
        return { ...prev, selectedInterests: arr.filter((i: any) => i.id !== interest.id) }
      }
      return { ...prev, selectedInterests: [...arr, interest] }
    })
  }

  const handleSave = async () => {
    if (!form.name || (!form.is_global && !form.service_id)) return
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        miles_radius: form.miles_radius || null,
        min_age: form.min_age || null,
        max_age: form.max_age || null,
        genders: form.genders,
        education_statuses: form.education_statuses,
        family_statuses: form.family_statuses,
        interests: form.selectedInterests,
        service_id: form.is_global ? null : form.service_id,
        is_global: form.is_global,
      }
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.AUDIENCE, payload)
      } else {
        await putSecure(SECURE_ENDPOINTS.AUDIENCE, { id, ...payload })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const MultiSelect = <T extends string | number>({
    label, options, selected, onToggle, optionKey, optionLabel,
  }: {
    label: string
    options: any[]
    selected: T[]
    onToggle: (v: T) => void
    optionKey: string
    optionLabel: string
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 border rounded p-2 min-h-[40px]">
        {options.map(opt => (
          <button key={opt[optionKey]} type="button" onClick={() => onToggle(opt[optionKey])}
            className={`px-2 py-0.5 rounded-full text-sm border transition-colors ${
              selected.includes(opt[optionKey])
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}>
            {opt[optionLabel]}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-5">
        <h2 className="text-xl font-bold">Target Market {isNew ? 'Add' : 'Edit'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" className="w-full border rounded px-3 py-2"
              value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Radius (miles)</label>
            <input type="number" className="w-full border rounded px-3 py-2"
              value={form.miles_radius} onChange={e => setForm(prev => ({ ...prev, miles_radius: Number(e.target.value) || '' }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Age (18–65)</label>
            <input type="number" min={18} max={65} className="w-full border rounded px-3 py-2"
              value={form.min_age} onChange={e => setForm(prev => ({ ...prev, min_age: Number(e.target.value) || '' }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Maximum Age (18–65)</label>
            <input type="number" min={18} max={65} className="w-full border rounded px-3 py-2"
              value={form.max_age} onChange={e => setForm(prev => ({ ...prev, max_age: Number(e.target.value) || '' }))} />
          </div>
        </div>

        <MultiSelect label="Genders" options={GENDER_OPTIONS} selected={form.genders}
          onToggle={v => toggleMulti('genders', v)} optionKey="value" optionLabel="name" />

        <MultiSelect label="Educations" options={EDUCATION_OPTIONS} selected={form.education_statuses}
          onToggle={v => toggleMulti('education_statuses', v)} optionKey="value" optionLabel="name" />

        <MultiSelect label="Family Statuses" options={familyStatusOptions} selected={form.family_statuses}
          onToggle={v => toggleMulti('family_statuses', v)} optionKey="id" optionLabel="name" />

        <div>
          <label className="block text-sm font-medium mb-1">Targeting Interests</label>
          <div className="flex flex-wrap gap-2 border rounded p-2 min-h-[40px]">
            {interests.map((interest: any) => (
              <button key={interest.id} type="button" onClick={() => toggleInterest(interest)}
                className={`px-2 py-0.5 rounded-full text-sm border transition-colors ${
                  form.selectedInterests.find((i: any) => i.id === interest.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}>
                {interest.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 items-start">
          {!form.is_global && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Service <span className="text-red-500">*</span></label>
              <select className="w-full border rounded px-3 py-2"
                value={form.service_id} onChange={e => setForm(prev => ({ ...prev, service_id: Number(e.target.value) || '' }))}>
                <option value="">Select service</option>
                {(services ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer mt-6">
            <input type="checkbox" checked={form.is_global}
              onChange={e => setForm(prev => ({ ...prev, is_global: e.target.checked, service_id: '' }))} />
            <span className="text-sm font-medium">Is Global?</span>
          </label>
        </div>

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isNew ? 'Save' : 'Update'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
