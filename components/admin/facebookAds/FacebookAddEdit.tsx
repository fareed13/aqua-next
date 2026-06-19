'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface FacebookAddEditProps {
  adsId?: string
}

const AD_TYPE_OPTIONS = ['A/B Test Ads', 'Basic Ad']
const CALL_TO_ACTION_TYPES = ['SIGN_UP', 'LEARN_MORE', 'SEND_MESSAGE']

interface BasicAdForm {
  titles: string[]
  bodies: string[]
  descriptions: string[]
  callToAction: string
}

export function FacebookAddEdit({ adsId }: FacebookAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const services = useOrgStore(s => s.services)
  const { getSecure, postSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [selectedAdType, setSelectedAdType] = useState('')
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [audiences, setAudiences] = useState<any[]>([])
  const [audience, setAudience] = useState<any>(null)
  const [leadCount, setLeadCount] = useState<number | ''>('')
  const monthlyBudget = typeof leadCount === 'number' ? leadCount * 15 : 0
  const [basicAd, setBasicAd] = useState<BasicAdForm>({
    titles: [], bodies: [], descriptions: [], callToAction: 'SIGN_UP',
  })
  const [titleInput, setTitleInput] = useState('')
  const [bodyInput, setBodyInput] = useState('')
  const [descInput, setDescInput] = useState('')

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
  }, [])

  useEffect(() => {
    if (selectedService) fetchAudiences()
  }, [selectedService])

  const fetchAudiences = async () => {
    try {
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.TARGET_AUDIENCE, { service_id: selectedService! })
      setAudiences(res ?? [])
    } catch { /* handled */ }
  }

  const addChip = (field: keyof Pick<BasicAdForm, 'titles' | 'bodies' | 'descriptions'>, value: string) => {
    if (!value.trim()) return
    setBasicAd(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
  }

  const removeChip = (field: keyof Pick<BasicAdForm, 'titles' | 'bodies' | 'descriptions'>, index: number) => {
    setBasicAd(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    if (!selectedService || !audience || !selectedAdType) return
    setLoading(true)
    try {
      const payload = {
        service_id: selectedService,
        audience_id: audience.id,
        pixel_id: audience.pixel_id ?? null,
        monthly_budget: monthlyBudget,
        ad_type: selectedAdType,
        titles: basicAd.titles,
        bodies: basicAd.bodies,
        descriptions: basicAd.descriptions,
        call_to_action_type: basicAd.callToAction,
      }
      await postSecure(SECURE_ENDPOINTS.FB_ADS, payload)
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const ChipRow = ({ label, chips, input, setInput, field }: {
    label: string
    chips: string[]
    input: string
    setInput: (v: string) => void
    field: keyof Pick<BasicAdForm, 'titles' | 'bodies' | 'descriptions'>
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 flex-wrap mb-2">
        {chips.map((c, i) => (
          <span key={i} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {c}
            <button onClick={() => removeChip(field, i)} className="ml-2 text-blue-500 hover:text-blue-700">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(field, input); setInput('') } }}
          placeholder={`Add ${label.toLowerCase()} and press Enter`}
          className="flex-1 border rounded px-3 py-2 text-sm" />
        <button onClick={() => { addChip(field, input); setInput('') }}
          className="bg-blue-600 text-white px-3 py-2 rounded text-sm">Add</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">Facebook Add/Edit</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Ad Type</label>
          <select className="w-full border rounded px-3 py-2"
            value={selectedAdType} onChange={e => setSelectedAdType(e.target.value)}>
            <option value="">Choose an ad type</option>
            {AD_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Program</label>
          <select className="w-full border rounded px-3 py-2"
            value={selectedService ?? ''} onChange={e => setSelectedService(Number(e.target.value) || null)}>
            <option value="">Choose a program</option>
            {(services ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Market</label>
          <select className="w-full border rounded px-3 py-2" disabled={!selectedService}
            value={audience?.id ?? ''} onChange={e => setAudience(audiences.find(a => a.id === Number(e.target.value)))}>
            <option value="">Choose target market</option>
            {audiences.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Leads</label>
            <input type="number" min={3} className="w-full border rounded px-3 py-2"
              value={leadCount} onChange={e => setLeadCount(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Budget</label>
            <input type="number" className="w-full border rounded px-3 py-2 bg-gray-100" disabled value={monthlyBudget} />
          </div>
        </div>

        {selectedAdType === 'Basic Ad' && (
          <>
            <ChipRow label="Title" chips={basicAd.titles} input={titleInput} setInput={setTitleInput} field="titles" />
            <ChipRow label="Call to Action" chips={basicAd.bodies} input={bodyInput} setInput={setBodyInput} field="bodies" />
            <ChipRow label="Sales Pitch" chips={basicAd.descriptions} input={descInput} setInput={setDescInput} field="descriptions" />
            <div>
              <label className="block text-sm font-medium mb-1">Call to Action Type</label>
              <select className="w-full border rounded px-3 py-2"
                value={basicAd.callToAction} onChange={e => setBasicAd(prev => ({ ...prev, callToAction: e.target.value }))}>
                {CALL_TO_ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </>
        )}

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading || !selectedService || !audience || !selectedAdType}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
