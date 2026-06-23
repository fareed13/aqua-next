'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface RedirectAddEditProps {
  redirectId?: string
}

function isValidUrl(v: string): boolean {
  if (v.startsWith('/')) return true
  try { new URL(v); return true } catch { return false }
}

export function RedirectAddEdit({ redirectId }: RedirectAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !redirectId
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [oldUrl, setOldUrl] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [errors, setErrors] = useState<{ oldUrl?: string; newUrl?: string }>({})

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (!isNew && redirectId) fetchRedirect()
  }, [])

  const fetchRedirect = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.REDIRECT, { id: parseInt(redirectId!) })
      const redirect = Array.isArray(res) ? res[0] : res
      if (redirect) {
        setId(redirect.id)
        setOldUrl(redirect.old_url ?? '')
        setNewUrl(redirect.new_url ?? '')
      }
    } catch { router.push('/admin/all-settings') }
    finally { setLoading(false) }
  }

  const validate = () => {
    const errs: typeof errors = {}
    if (!oldUrl) errs.oldUrl = 'Required'
    else if (!isValidUrl(oldUrl)) errs.oldUrl = 'Invalid URL. Use /path or https://domain.com/path'
    if (!newUrl) errs.newUrl = 'Required'
    else if (!isValidUrl(newUrl)) errs.newUrl = 'Invalid URL format. Use /path or https://domain.com/path'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = { old_url: oldUrl, new_url: newUrl, organization: organization?.id }
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.REDIRECT, payload)
      } else {
        await putSecure(SECURE_ENDPOINTS.REDIRECT, { id, ...payload })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const currentDomain = typeof window !== 'undefined'
    ? window.location.hostname.replace(/^www\./, '').replace(/^([^-]+)-admin(-.*)?\./, '$1.')
    : ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">{isNew ? 'Add Redirect' : 'Edit Redirect'}</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Old URL <span className="text-red-500">*</span></label>
          <input type="text"
            className={`w-full border rounded px-3 py-2 ${errors.oldUrl ? 'border-red-500' : ''}`}
            value={oldUrl} onChange={e => setOldUrl(e.target.value)}
            placeholder={currentDomain ? `/old-path or https://${currentDomain}/old-path` : '/old-path'} />
          {errors.oldUrl && <p className="text-red-500 text-xs mt-1">{errors.oldUrl}</p>}
          {currentDomain && (
            <p className="text-gray-400 text-xs mt-1">
              Must be a path on this site ({currentDomain}) or a full URL with this site's domain
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New URL <span className="text-red-500">*</span></label>
          <input type="text"
            className={`w-full border rounded px-3 py-2 ${errors.newUrl ? 'border-red-500' : ''}`}
            value={newUrl} onChange={e => setNewUrl(e.target.value)}
            placeholder="/new-path or https://any-domain.com/new-path" />
          {errors.newUrl && <p className="text-red-500 text-xs mt-1">{errors.newUrl}</p>}
          <p className="text-gray-400 text-xs mt-1">
            Can be a path on this site or any external URL (for cross-domain redirects)
          </p>
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
