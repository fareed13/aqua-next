'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface SocialMediaAddEditProps {
  socialId?: string
}

const PLATFORMS = [
  { title: 'Facebook', value: 'facebook' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'Twitter', value: 'twitter' },
  { title: 'Google', value: 'google' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'Pinterest', value: 'pinterest' },
]

export function SocialMediaAddEdit({ socialId }: SocialMediaAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const locations = useOrgStore(s => s.locations)
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !socialId
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState('')
  const [locationId, setLocationId] = useState<number | ''>('')

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (!isNew && socialId) fetchSocialMedia()
  }, [])

  const fetchSocialMedia = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.SOCIAL_MEDIA, { id: parseInt(socialId!) })
      const sm = Array.isArray(res) ? res[0] : res
      if (sm) {
        setId(sm.id)
        setUrl(sm.url ?? '')
        setPlatform(sm.platform ?? '')
        setLocationId(sm.location?.id ?? '')
      }
    } catch { router.push('/admin/all-settings') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!url || !platform || !locationId) return
    setLoading(true)
    try {
      const payload = { url, platform, location: locationId }
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.SOCIAL_MEDIA, payload)
      } else {
        await putSecure(SECURE_ENDPOINTS.SOCIAL_MEDIA, { id, ...payload })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const selectedPlatformLabel = PLATFORMS.find(p => p.value === platform)?.title

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">{isNew ? 'Add Social Media' : 'Edit Social Media'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location <span className="text-red-500">*</span></label>
            <select className="w-full border rounded px-3 py-2"
              value={locationId} onChange={e => setLocationId(Number(e.target.value) || '')}>
              <option value="">Select a location</option>
              {locations.map((loc: any) => (
                <option key={loc.id} value={loc.id}>{loc.target_locations?.[0] ?? loc.id}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Platform <span className="text-red-500">*</span></label>
            <select className="w-full border rounded px-3 py-2"
              value={platform} onChange={e => setPlatform(e.target.value)}>
              <option value="">Select social media platform</option>
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Social Media URL <span className="text-red-500">*</span></label>
          <input type="text" className="w-full border rounded px-3 py-2"
            value={url} onChange={e => setUrl(e.target.value)}
            placeholder="Enter social media profile URL" />
        </div>

        {platform && (
          <div className="p-3 bg-gray-50 border rounded">
            <p className="text-sm text-gray-500">Selected Platform:</p>
            <p className="font-semibold">{selectedPlatformLabel}</p>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading || !url || !platform || !locationId}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isNew ? 'Save Social Media' : 'Update Social Media'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
