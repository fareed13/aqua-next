'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface AdLibraryAddEditProps {
  adId?: string
}

const AD_TYPES = [
  { label: 'Facebook', value: 1 },
  { label: 'Google', value: 2 },
]

export function AdLibraryAddEdit({ adId }: AdLibraryAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !adId
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    ad_type: '' as string | number,
    titles: [] as string[],
    contents: [] as string[],
    primary_texts: [] as string[],
    tags: [] as string[],
    service_type: '',
    is_global: false,
  })
  const [titleInput, setTitleInput] = useState('')
  const [contentInput, setContentInput] = useState('')
  const [primaryTextInput, setPrimaryTextInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (!isNew && adId) fetchAd()
  }, [])

  const fetchAd = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE, { id: parseInt(adId!) })
      const ad = Array.isArray(res) ? res[0] : res
      if (ad) {
        setForm({
          name: ad.name ?? '',
          ad_type: ad.ad_type ?? '',
          titles: ad.titles ?? [],
          contents: ad.contents ?? [],
          primary_texts: ad.primary_texts ?? [],
          tags: ad.tags ?? [],
          service_type: ad.service_type ?? '',
          is_global: false,
        })
      }
    } catch { router.push('/admin/all-settings') }
    finally { setLoading(false) }
  }

  const addChip = (field: 'titles' | 'contents' | 'primary_texts' | 'tags', value: string) => {
    if (!value.trim()) return
    setForm(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
  }

  const removeChip = (field: 'titles' | 'contents' | 'primary_texts' | 'tags', index: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    if (!form.name || !form.ad_type || !form.service_type) return
    setLoading(true)
    try {
      const payload = { ...form }
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE, payload)
      } else {
        await putSecure(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE, { id: Number(adId), ...payload })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const ChipInput = ({
    label, chips, input, setInput, field,
  }: {
    label: string
    chips: string[]
    input: string
    setInput: (v: string) => void
    field: 'titles' | 'contents' | 'primary_texts' | 'tags'
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 flex-wrap mb-2">
        {chips.map((chip, i) => (
          <span key={i} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {chip}
            <button onClick={() => removeChip(field, i)} className="ml-2 text-blue-500 hover:text-blue-700">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(field, input); setInput('') } }}
          placeholder={`Add ${label.toLowerCase()} and press Enter`}
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button onClick={() => { addChip(field, input); setInput('') }}
          className="bg-blue-600 text-white px-3 py-2 rounded text-sm">Add</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">{isNew ? 'Create Ad' : 'Edit Ad'}</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Ad Type</label>
          <select className="w-full border rounded px-3 py-2"
            value={form.ad_type}
            onChange={e => setForm(prev => ({ ...prev, ad_type: e.target.value }))}>
            <option value="">Select ad type</option>
            {AD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" className="w-full border rounded px-3 py-2"
            value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
        </div>

        <ChipInput label="Titles" chips={form.titles} input={titleInput} setInput={setTitleInput} field="titles" />
        <ChipInput label="Descriptions" chips={form.contents} input={contentInput} setInput={setContentInput} field="contents" />
        <ChipInput label="Primary Texts" chips={form.primary_texts} input={primaryTextInput} setInput={setPrimaryTextInput} field="primary_texts" />
        <ChipInput label="Tags" chips={form.tags} input={tagInput} setInput={setTagInput} field="tags" />

        <div>
          <label className="block text-sm font-medium mb-1">Service Type</label>
          <input type="text" className="w-full border rounded px-3 py-2"
            value={form.service_type} onChange={e => setForm(prev => ({ ...prev, service_type: e.target.value }))} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_global" checked={form.is_global}
            onChange={e => setForm(prev => ({ ...prev, is_global: e.target.checked }))} />
          <label htmlFor="is_global" className="text-sm font-medium">Is Global?</label>
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
