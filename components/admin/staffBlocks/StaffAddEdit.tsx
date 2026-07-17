'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useOrgStore, useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useContentBuilder } from '@/hooks/admin/useContentBuilder'
import { checkContentHttp } from '@/lib/utils/pageUtils'
import { buildMediaUrl } from '@/lib/utils/media'
import { QuillEditor } from '@/components/QuillEditor'
import { ImageSelector } from '@/components/ImageSelector'
import { MultiSelectChips } from '@/components/customers/MultiSelectChips'

interface MediaItem { uuid: string; name: string; extension: string }

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

interface StaffAddEditProps {
  open: boolean
  staff: any | null // null = add mode; a staff row = edit mode
  onClose: () => void
}

/** Ports Nuxt staffBlocks/StaffAddEdit.vue — the add/edit instructor dialog. */
export function StaffAddEdit({ open, staff, onClose }: StaffAddEditProps) {
  const { getSecure, postSecure, putSecure } = useSecureCalls()
  const { fetchMediaByOrganization, baseImageUrl, baseVideoUrl } = useContentBuilder()
  const organization = useOrgStore((s) => s.organization)
  const primaryLocation = useOrgStore((s) => s.location)
  const locations = useOrgStore((s) => s.locations) as unknown as Array<{ id: number; city: string }>
  const services = useOrgServices() as unknown as Array<{ id: number; name: string }>

  const editMode = !!staff
  const [id, setId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [order, setOrder] = useState<number | ''>(0)
  const [bio, setBio] = useState('')
  const [mediaId, setMediaId] = useState('')
  const [staffLocations, setStaffLocations] = useState<number[]>([])
  const [serviceIds, setServiceIds] = useState<number[]>([])
  const [medias, setMedias] = useState<MediaItem[]>([])
  const [overlay, setOverlay] = useState(false)
  const [editorEmpty, setEditorEmpty] = useState(false)

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetchMediaByOrganization()
      setMedias(Array.isArray(res) ? (res as MediaItem[]) : [])
    } catch { /* ignore */ }
  }, [fetchMediaByOrganization])

  const reset = () => {
    setId(null); setName(''); setOrder(0); setBio(''); setMediaId('')
    setServiceIds([]); setStaffLocations([]); setEditorEmpty(false)
  }

  useEffect(() => {
    if (!open) return
    fetchMedia()
    if (staff) {
      ;(async () => {
        setOverlay(true)
        try {
          const res = await getSecure<any[]>(SECURE_ENDPOINTS.STAFF, { id: staff.id })
          const s = Array.isArray(res) ? res[0] : res
          if (s) {
            setId(s.id); setName(s.name ?? ''); setOrder(s.order ?? 0)
            setMediaId(s.media?.uuid ?? '')
            setServiceIds(Array.isArray(s.staff_services) ? s.staff_services : [])
            setStaffLocations(Array.isArray(s.staff_locations) ? s.staff_locations : [])
            setBio(s.bio ?? '')
          }
        } finally { setOverlay(false) }
      })()
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff])

  const mediaPreview = useMemo(() => {
    if (!mediaId) return null
    const m = medias.find((x) => x.uuid === mediaId)
    if (!m) return null
    const isVideo = m.extension === 'mp4'
    return { url: buildMediaUrl(m as any, 700), isVideo, base: isVideo ? baseVideoUrl : baseImageUrl }
  }, [mediaId, medias, baseImageUrl, baseVideoUrl])

  const isEditorEmpty = () => {
    const t = bio?.trim()
    if (!t) return true
    return t.replace(/<(.|\n)*?>/g, '').trim().length === 0
  }

  const validate = () => {
    const empty = isEditorEmpty()
    setEditorEmpty(empty)
    if (!name.trim() || order === '' || !mediaId || empty) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return false
    }
    if (checkContentHttp(bio)) {
      toast.error('Content contains non secure http:// link')
      return false
    }
    return true
  }

  const payload = () => ({
    name,
    bio,
    order,
    media: mediaId,
    slug: slugify(name),
    location: primaryLocation?.id,
    staff_services: serviceIds,
    staff_locations: staffLocations,
    organization: organization?.id,
  })

  const save = async () => {
    if (!validate()) return
    setOverlay(true)
    try {
      if (editMode) {
        await putSecure(SECURE_ENDPOINTS.STAFF, { id, ...payload() })
        toast.success('updated Successfully', { duration: 15000 })
      } else {
        await postSecure(SECURE_ENDPOINTS.STAFF, payload())
        toast.success('Added Successfully', { duration: 15000 })
      }
      onClose()
    } catch { /* handled */ } finally {
      setOverlay(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-[1000px] overflow-y-auto rounded-lg bg-white shadow-lg">
        {overlay && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/60">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
          </div>
        )}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-black">{editMode ? 'Edit staff' : 'Add staff'}</h1>
          <button onClick={onClose} aria-label="Close"><X size={22} /></button>
        </div>

        <div className="space-y-4 p-6">
          <div><label className={LABEL}>Name *</label><input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className={LABEL}>Order *</label><input type="number" className={FIELD} value={order} onChange={(e) => setOrder(e.target.value === '' ? '' : Number(e.target.value))} /></div>

          <div>
            <label className={LABEL}>Bio *</label>
            <QuillEditor content={bio} contentType="html" {...{ 'onUpdate:content': (html: string) => setBio(html) }} />
            {editorEmpty && <p className="mt-1 pl-1 text-sm text-red-600">Field is required</p>}
          </div>

          <div>
            <label className={LABEL}>Photo / Video *</label>
            <div className="flex items-center gap-4 rounded border border-[#c4c4c4] p-3">
              <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                {mediaPreview ? (
                  mediaPreview.isVideo ? (
                    <video src={`${mediaPreview.url}#t=2`} className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-only preview
                    <img src={mediaPreview.url} alt="Staff" className="max-h-full max-w-full object-contain" />
                  )
                ) : (
                  <span className="text-center text-xs text-gray-400">No media</span>
                )}
              </div>
              <ImageSelector
                medias={medias}
                preSelected={mediaId}
                onImageSelected={(uuid: string) => setMediaId(uuid)}
                refreshMedia={fetchMedia}
                isUploader
                buttonText="Select Media"
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Location</label>
            <MultiSelectChips
              options={locations.map((l) => ({ id: l.id, name: l.city }))}
              value={staffLocations}
              onChange={setStaffLocations}
              placeholder="Select locations"
            />
          </div>

          <div>
            <label className={LABEL}>Service</label>
            <MultiSelectChips
              options={services.map((s) => ({ id: s.id, name: s.name }))}
              value={serviceIds}
              onChange={setServiceIds}
              placeholder="Select services"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t px-6 py-4">
          <button onClick={save} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white">
            {editMode ? 'Update' : 'Save'}
          </button>
          <button onClick={onClose} className="rounded bg-gray-200 px-6 py-2.5 font-medium text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}
