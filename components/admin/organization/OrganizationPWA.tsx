'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Smartphone, ImageOff, Save } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

// Mirror secureClient's rule: the cookie may already be "Bearer …"-prefixed.
function authHeader(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.split('; ').find((c) => c.startsWith('auth._token.local='))
  if (!match) return ''
  const raw = decodeURIComponent(match.split('=')[1] ?? '')
  return raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
}

export function OrganizationPWA() {
  const { getSecure } = useSecureCalls()
  const organization = useOrgStore((s) => s.organization)

  const [pwaEnabled, setPwaEnabled] = useState(false)
  const [media, setMedia] = useState<{ uuid: string; extension?: string } | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [overlay, setOverlay] = useState(false)

  useEffect(() => {
    ;(async () => {
      setOverlay(true)
      try {
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.ORGANIZATION_PWA)
        const d = Array.isArray(res) ? res[0] : res
        if (d) { setMedia(d.media ?? null); setPwaEnabled(!!d.pwa_enabled) }
      } catch { /* handled */ } finally {
        setOverlay(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mediaUrl = useMemo(() => {
    if (uploadedFile) return URL.createObjectURL(uploadedFile)
    if (media?.uuid) return `${MEDIA_URL}/${media.uuid}`
    return ''
  }, [uploadedFile, media])

  const save = async () => {
    setOverlay(true)
    try {
      const fd = new FormData()
      if (uploadedFile) fd.append('media', uploadedFile)
      fd.append('pwa_enabled', String(pwaEnabled))
      const url = new URL(`${BACKEND_URL}${SECURE_ENDPOINTS.ORGANIZATION_PWA}`)
      if (organization?.id) url.searchParams.set('organization_id', String(organization.id))
      const res = await fetch(url.toString(), {
        method: 'PUT',
        headers: { Authorization: authHeader() },
        body: fd,
      })
      if (!res.ok) throw new Error(`PWA update failed [${res.status}]`)
      const data = await res.json()
      setPwaEnabled(!!data.pwa_enabled)
      setMedia(data.media ?? null)
      setUploadedFile(null)
      toast.success('PWA settings updated successfully', { duration: 3000 })
    } catch {
      toast.error('Media can not be added', { duration: 5000 })
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

      {/* Header */}
      <div className="mb-8 bg-[#124e66] p-6">
        <h1 className="mb-2 flex items-center gap-3 text-xl font-medium text-white md:text-3xl">
          <Smartphone size={30} /> Progressive Web App Settings
        </h1>
        <p className="text-white/75">Configure your app&apos;s PWA features and appearance</p>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-8">
        <div className="rounded-xl bg-white p-4 shadow md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Settings */}
            <div className="rounded-xl border border-black/5 bg-[#f8fafc] p-6">
              <div className="mb-6 flex items-center">
                <div>
                  <h2 className="mb-1 text-lg font-medium">PWA Mode</h2>
                  <p className="text-sm text-gray-500">Enable or disable Progressive Web App functionality</p>
                </div>
                <label className="ml-auto inline-flex cursor-pointer items-center">
                  <input type="checkbox" checked={pwaEnabled} onChange={(e) => setPwaEnabled(e.target.checked)} className="peer sr-only" />
                  <span className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-[#124E66]">
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                  </span>
                </label>
              </div>

              {pwaEnabled && (
                <div>
                  <hr className="mb-6" />
                  <h2 className="mb-3 text-lg font-medium">App Icon</h2>
                  <p className="mb-4 text-sm text-gray-500">Upload a square image (512x512px recommended) to be used as your app icon</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-base file:mr-3 file:rounded file:border-0 file:bg-[#124e66] file:px-3 file:py-1.5 file:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">{uploadedFile ? 'Click Save to apply changes' : 'PNG or JPG up to 2MB'}</p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="flex flex-col">
              <h2 className="mb-4 text-lg font-medium">Icon Preview</h2>
              <div className="flex flex-1 items-center justify-center rounded-xl bg-[#f1f5f9] p-8">
                <div className="flex h-[200px] w-[200px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-white shadow-md max-md:h-40 max-md:w-40">
                  {mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-only preview
                    <img src={mediaUrl} alt="PWA icon preview" className="h-full w-full object-contain" />
                  ) : (
                    <>
                      <ImageOff size={64} className="text-gray-400" />
                      <span className="mt-3 text-sm text-gray-500">No icon uploaded</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6" />
          <div className="flex justify-end">
            <button onClick={save} disabled={overlay} className="flex items-center gap-2 rounded bg-[#124E66] px-6 py-2.5 font-medium text-white disabled:opacity-50">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
