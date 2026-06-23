'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
const AUTH_COOKIE = 'auth._token.local'

function getToken(): string | null {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find(c => c.startsWith(`${AUTH_COOKIE}=`))?.split('=')[1] ?? null
}

interface GmbMediaEntry {
  file: File
  description: string
  preview: string
}

export function GmbMediaAddEdit() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)

  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<GmbMediaEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login') }
  }, [])

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newEntries = files.map(file => ({
      file,
      description: '',
      preview: URL.createObjectURL(file),
    }))
    setEntries(newEntries)
  }

  const updateDescription = (index: number, value: string) => {
    setEntries(prev => prev.map((entry, i) => i === index ? { ...entry, description: value } : entry))
  }

  const handleSave = async () => {
    if (!entries.length) return
    setLoading(true)
    try {
      const formData = new FormData()
      entries.forEach(entry => {
        formData.append('posts', JSON.stringify({
          description: entry.description,
          organization: organization?.id,
          week: '',
        }))
        formData.append('media', entry.file)
      })
      const token = getToken()
      const res = await fetch(`${BACKEND_URL}${SECURE_ENDPOINTS.GMB_MEDIA}`, {
        method: 'POST',
        headers: token ? { Authorization: token } : {},
        body: formData,
      })
      if (!res.ok) throw new Error(res.statusText)
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold">Add GMB Post</h2>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Media Files</label>
          <div className="flex gap-4 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpg,image/jpeg,image/webp"
              multiple
              onChange={handleFilesChange}
              className="flex-1 border rounded px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
            />
          </div>
        </div>

        {entries.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Media Configuration</h3>
            {entries.map((entry, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Media {index + 1}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{entry.file.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <img src={entry.preview} alt={entry.file.name}
                      className="w-full aspect-square object-cover rounded border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea
                      rows={6}
                      value={entry.description}
                      onChange={e => updateDescription(index, e.target.value)}
                      placeholder="Enter a description for this media post..."
                      className="w-full border rounded px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading || !entries.length}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Uploading...' : 'Add GMB Posts'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
