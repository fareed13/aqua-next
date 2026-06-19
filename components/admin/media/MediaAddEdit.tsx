'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
const AUTH_COOKIE = 'auth._token.local'

function getToken(): string | null {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find(c => c.startsWith(`${AUTH_COOKIE}=`))?.split('=')[1] ?? null
}

const TOPIC_OPTIONS = ['General', 'Ad', 'Blog', 'Classes', 'Curriculum', 'Location', 'Profile']
const SERVICE_TYPE_OPTIONS = ['Martial Arts', 'Yoga', 'Fitness', 'Dance', 'Swimming', 'Gymnastics']

interface FileEntry {
  file: File
  preview: string
  name: string
  topics: string[]
  types: string[]
  pwa_icon: boolean
  background_image: boolean
  is_secure: boolean
  facility_location: number | null
}

interface MediaAddEditProps {
  mediaId?: string
}

export function MediaAddEdit({ mediaId }: MediaAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const locations = useOrgStore(s => s.locations)
  const { getSecure, putSecure } = useSecureCalls()

  const isEdit = !!mediaId
  const [loading, setLoading] = useState(false)
  const [mediaObj, setMediaObj] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: '', topics: [] as string[], service_types: [] as string[] })
  const [entries, setEntries] = useState<FileEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (isEdit) fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.MEDIA, { uuid: mediaId })
      const media = Array.isArray(res) ? res[0] : res
      if (media) {
        setMediaObj(media)
        setEditForm({ name: media.name ?? '', topics: media.topics ?? [], service_types: media.service_type ?? [] })
      }
    } catch { router.push('/admin/all-settings') }
    finally { setLoading(false) }
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setEntries(files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name.replace(/\.[^.]+$/, ''),
      topics: [],
      types: [],
      pwa_icon: false,
      background_image: false,
      is_secure: false,
      facility_location: null,
    })))
  }

  const updateEntry = (index: number, patch: Partial<FileEntry>) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, ...patch } : e))
  }

  const toggleEntryTag = (
    index: number,
    field: 'topics' | 'types',
    value: string,
    max?: number,
  ) => {
    setEntries(prev => prev.map((e, i) => {
      if (i !== index) return e
      const arr = e[field] as string[]
      if (arr.includes(value)) return { ...e, [field]: arr.filter(v => v !== value) }
      if (max && arr.length >= max) return e
      return { ...e, [field]: [...arr, value] }
    }))
  }

  const handleSaveNew = async () => {
    if (!entries.length) return
    setLoading(true)
    try {
      const token = getToken()
      for (const entry of entries) {
        const fd = new FormData()
        fd.append('media', entry.file)
        fd.append('name', entry.name)
        fd.append('topics', JSON.stringify(entry.topics))
        fd.append('service_type', JSON.stringify(entry.types))
        fd.append('pwa_icon', String(entry.pwa_icon))
        fd.append('background_image', String(entry.background_image))
        fd.append('is_secure', String(entry.is_secure))
        if (entry.facility_location) fd.append('facility_location', String(entry.facility_location))
        await fetch(`${BACKEND_URL}${SECURE_ENDPOINTS.MEDIA}`, {
          method: 'POST',
          headers: token ? { Authorization: token } : {},
          body: fd,
        })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await putSecure(SECURE_ENDPOINTS.MEDIA, {
        uuid: mediaId,
        name: editForm.name,
        topics: editForm.topics,
        service_type: editForm.service_types,
      })
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const toggleEditTag = (field: 'topics' | 'service_types', value: string, max?: number) => {
    setEditForm(prev => {
      const arr = prev[field] as string[]
      if (arr.includes(value)) return { ...prev, [field]: arr.filter(v => v !== value) }
      if (max && arr.length >= max) return prev
      return { ...prev, [field]: [...arr, value] }
    })
  }

  if (isEdit && !mediaObj && loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-gray-500">Loading media...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold">{isEdit ? 'Edit Media' : 'Add New Media'}</h2>

        {isEdit && mediaObj ? (
          /* Edit mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Media Preview</h3>
              {mediaObj.extension === 'mp4' || mediaObj.media_type === 'video' ? (
                <video controls className="w-full rounded border max-h-64 object-cover" />
              ) : (
                <img alt={mediaObj.name} className="w-full rounded border max-h-64 object-cover" />
              )}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold mb-2">Edit Details</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Media Name</label>
                <input type="text" className="w-full border rounded px-3 py-2"
                  value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Topics <span className="text-gray-400 text-xs">(max 2)</span></label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_OPTIONS.map(t => (
                    <button key={t} type="button" onClick={() => toggleEditTag('topics', t, 2)}
                      className={`px-3 py-1 rounded-full text-sm border ${editForm.topics.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service Types</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TYPE_OPTIONS.map(t => (
                    <button key={t} type="button" onClick={() => toggleEditTag('service_types', t)}
                      className={`px-3 py-1 rounded-full text-sm border ${editForm.service_types.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleUpdate} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Media'}
              </button>
            </div>
          </div>
        ) : (
          /* Add mode */
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Upload Media Files</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp,video/*"
                multiple
                onChange={handleFilesChange}
                className="w-full border rounded px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
              />
            </div>

            {entries.map((entry, i) => (
              <div key={i} className="border rounded p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">{entry.file.name}</p>
                    {entry.file.type.includes('video') ? (
                      <video src={entry.preview} controls className="w-full rounded border max-h-48 object-cover" />
                    ) : (
                      <img src={entry.preview} alt={entry.file.name} className="w-full rounded border max-h-48 object-cover" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">File Name</label>
                      <input type="text" className="w-full border rounded px-2 py-1 text-sm"
                        value={entry.name} onChange={e => updateEntry(i, { name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Topics (max 2)</label>
                      <div className="flex flex-wrap gap-1">
                        {TOPIC_OPTIONS.map(t => (
                          <button key={t} type="button" onClick={() => toggleEntryTag(i, 'topics', t, 2)}
                            className={`px-2 py-0.5 rounded-full text-xs border ${entry.topics.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Service Types</label>
                      <div className="flex flex-wrap gap-1">
                        {SERVICE_TYPE_OPTIONS.map(t => (
                          <button key={t} type="button" onClick={() => toggleEntryTag(i, 'types', t)}
                            className={`px-2 py-0.5 rounded-full text-xs border ${entry.types.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {([['pwa_icon', 'PWA Icon'], ['background_image', 'Background'], ['is_secure', 'Is Secure']] as const).map(([field, label]) => (
                        <label key={field} className="flex items-center gap-1 cursor-pointer text-xs">
                          <input type="checkbox" checked={entry[field] as boolean}
                            onChange={e => updateEntry(i, { [field]: e.target.checked })} />
                          {label}
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Location</label>
                      <select className="w-full border rounded px-2 py-1 text-sm"
                        value={entry.facility_location ?? ''}
                        onChange={e => updateEntry(i, { facility_location: Number(e.target.value) || null })}>
                        <option value="">Select location</option>
                        {locations.map((loc: any) => (
                          <option key={loc.id} value={loc.id}>{loc.target_locations?.[0] ?? loc.id}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-2">
              <button onClick={handleSaveNew} disabled={loading || !entries.length}
                className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Media Files'}
              </button>
              <button onClick={() => router.push('/admin/all-settings')}
                className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
