'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RefreshCw, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useAdminMediaCrud } from '@/hooks/admin/useAdminMedia'
import { useAdminService } from '@/hooks/admin/useAdminService'
import { ImageSelector } from '@/components/ImageSelector'

interface AdLibraryAddEditProps {
  adId?: string
  /** When hosted inline (settings accordion) these swap route navigation for a toggle. */
  onClose?: () => void
  onSaved?: () => void
}

interface AdMediaItem {
  id?: number
  uuid: string
  name: string
  extension: string
  media_type?: string
  topics?: Array<string | { name: string }>
  organization?: number
  is_global?: boolean
}

interface ServiceType {
  id?: number
  name: string
}

interface AdRecord {
  id: number
  name?: string
  ad_type?: number
  contents?: string[]
  titles?: string[]
  primary_texts?: string[]
  tags?: string[]
  service_type?: string
  media?: { uuid?: string } | null
  organization?: number
}

const AD_TYPES = [
  { text: 'Facebook', value: 1 },
  { text: 'Google', value: 2 },
]

// ABBI global stock org id (mirrors Nuxt `organization === 3`)
const GLOBAL_ORG_ID = Number(process.env.NEXT_PUBLIC_ABBI_DEFAULT_ORGANIZATION_ID ?? 3)

const FIELD = 'w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

type ChipField = 'titles' | 'contents' | 'primary_texts' | 'tags'
type AiField = 'titles' | 'contents' | 'primary_texts'

function topicName(t: string | { name: string }): string {
  return typeof t === 'string' ? t : t?.name
}

export function AdLibraryAddEdit({ adId, onClose, onSaved }: AdLibraryAddEditProps) {
  const router = useRouter()
  const { isSuperAdminLoggedIn } = useAuth()
  const organization = useOrgStore((s) => s.organization)
  const { getSecure, postSecure, putSecure } = useSecureCalls()
  const { fetchMediaByOrganization } = useAdminMediaCrud()
  const { serviceTypes, fetchServiceTypes } = useAdminService()

  const editMode = !!adId

  const [id, setId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [adType, setAdType] = useState<number | ''>('')
  const [titles, setTitles] = useState<string[]>([])
  const [contents, setContents] = useState<string[]>([])
  const [primaryTexts, setPrimaryTexts] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [serviceType, setServiceType] = useState('')
  const [isGlobal, setIsGlobal] = useState(false)
  const [media, setMedia] = useState('')

  const [medias, setMedias] = useState<AdMediaItem[]>([])
  const [adMedias, setAdMedias] = useState<AdMediaItem[]>([])
  const [overlay, setOverlay] = useState(false)
  const [aiBtnLoading, setAiBtnLoading] = useState(false)
  const [targetedBtn, setTargetedBtn] = useState<AiField | ''>('')

  const done = useCallback(() => {
    if (onClose) onClose()
    else router.push('/admin/all-settings')
  }, [onClose, router])

  const fetchMedia = useCallback(async () => {
    try {
      const res = (await fetchMediaByOrganization()) as AdMediaItem[]
      const list = Array.isArray(res) ? res : []
      setMedias(list)
      setAdMedias(
        list.filter((m) => (m.topics ? m.topics.some((st) => topicName(st) === 'Ad') : false)),
      )
    } catch {
      /* handled in hook */
    }
  }, [fetchMediaByOrganization])

  // Initial load: service types + media, then (edit) hydrate the record.
  useEffect(() => {
    ;(async () => {
      try {
        setOverlay(true)
        await Promise.all([fetchServiceTypes(), fetchMedia()])
      } finally {
        setOverlay(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!adId) return
    ;(async () => {
      try {
        setOverlay(true)
        const res = await getSecure<AdRecord[]>(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE, {
          id: parseInt(adId, 10),
        })
        const ad = Array.isArray(res) ? res[0] : (res as unknown as AdRecord)
        if (ad) {
          setId(ad.id)
          setName(ad.name ?? '')
          setAdType(ad.ad_type ?? '')
          setContents(ad.contents ?? [])
          setTitles(ad.titles ?? [])
          setPrimaryTexts(ad.primary_texts ?? [])
          setTags(ad.tags ?? [])
          setServiceType(ad.service_type ?? '')
          setMedia(ad.media?.uuid ?? '')
          setIsGlobal(ad.organization === GLOBAL_ORG_ID)
        }
      } catch {
        done()
      } finally {
        setOverlay(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId])

  const chipSetters: Record<ChipField, (updater: (prev: string[]) => string[]) => void> = {
    titles: setTitles,
    contents: setContents,
    primary_texts: setPrimaryTexts,
    tags: setTags,
  }

  const addChip = (field: ChipField, value: string) => {
    const v = value.trim()
    if (!v) return
    chipSetters[field]((prev) => [...prev, v])
  }
  const removeChip = (field: ChipField, index: number) => {
    chipSetters[field]((prev) => prev.filter((_, i) => i !== index))
  }

  async function getAIGeneratedAdText(textFor: AiField) {
    try {
      setAiBtnLoading(true)
      setTargetedBtn(textFor)
      const res = await postSecure<{ completion: string }>(SECURE_ENDPOINTS.AD_TEXT, {
        text_for: textFor,
      })
      const completion = res?.completion
      if (completion) chipSetters[textFor]((prev) => [...prev, completion])
    } catch {
      toast.error('AI Text generation failed, Try to add manually.', { duration: 15000 })
    } finally {
      setAiBtnLoading(false)
      setTargetedBtn('')
    }
  }

  const selectedMediaObj = medias.find((m) => m.uuid === media)
  const isVideo = (m?: AdMediaItem) => !!m && (m.extension === 'mp4' || m.media_type === 'video')
  const getMediaSrc = (uuid: string, size = 1000) => {
    const m = medias.find((x) => x.uuid === uuid)
    if (!m) return ''
    const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
    const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? MEDIA_URL
    const base = isVideo(m) ? VIDEO_URL : MEDIA_URL
    return `${base}/${m.uuid}_${size}.${m.extension}`
  }

  const validate = () => {
    if (!name.trim() || adType === '' || !serviceType) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return false
    }
    return true
  }

  const buildPayload = () => ({
    name,
    organization: organization?.id,
    ad_type: adType,
    contents,
    media,
    primary_texts: primaryTexts,
    service_type: serviceType,
    tags,
    titles,
    is_global: isGlobal,
  })

  async function create() {
    if (!validate()) return
    try {
      setOverlay(true)
      await postSecure(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE, buildPayload())
      toast.success('Ad Template created successfully', { duration: 15000 })
      onSaved?.()
      done()
    } catch {
      done()
    } finally {
      setOverlay(false)
    }
  }

  async function update() {
    if (!validate()) return
    try {
      setOverlay(true)
      await putSecure(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE, { id, ...buildPayload() })
      toast.success('Ad Updated successfully', { duration: 15000 })
      onSaved?.()
      done()
    } catch {
      done()
    } finally {
      setOverlay(false)
    }
  }

  return (
    <div className="relative min-h-full bg-white">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-10 md:py-10">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-semibold text-black">{editMode ? 'Edit Ad' : 'Create Ad'}</h1>
          <button onClick={done} aria-label="Close" className="text-gray-500 hover:text-gray-800">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className={LABEL}>Ad Type *</label>
            <select
              className={FIELD}
              value={adType}
              onChange={(e) => setAdType(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Select Ad Type</option>
              {AD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL}>Name *</label>
            <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <ChipCombobox label="Titles" field="titles" chips={titles} onAdd={addChip} onRemove={removeChip}
            aiLabel="AI Title" onAi={() => getAIGeneratedAdText('titles')} aiLoading={aiBtnLoading && targetedBtn === 'titles'} />
          <ChipCombobox label="Descriptions" field="contents" chips={contents} onAdd={addChip} onRemove={removeChip}
            aiLabel="AI Content" onAi={() => getAIGeneratedAdText('contents')} aiLoading={aiBtnLoading && targetedBtn === 'contents'} />
          <ChipCombobox label="Primary Texts" field="primary_texts" chips={primaryTexts} onAdd={addChip} onRemove={removeChip}
            aiLabel="AI Content" onAi={() => getAIGeneratedAdText('primary_texts')} aiLoading={aiBtnLoading && targetedBtn === 'primary_texts'} />
          <ChipCombobox label="Tags" field="tags" chips={tags} onAdd={addChip} onRemove={removeChip} />

          <div>
            <label className={LABEL}>Service Type *</label>
            <select className={FIELD} value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              <option value="">Select Service Type</option>
              {(serviceTypes as ServiceType[]).map((st) => (
                <option key={st.id ?? st.name} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {isSuperAdminLoggedIn() && (
            <label className="flex items-center gap-3 select-none">
              <button
                type="button"
                role="switch"
                aria-checked={isGlobal}
                onClick={() => setIsGlobal((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isGlobal ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGlobal ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">Is Global?</span>
            </label>
          )}

          <div>
            <label className={LABEL}>Media</label>
            {media ? (
              <div className="mb-3">
                {isVideo(selectedMediaObj) ? (
                  <video src={`${getMediaSrc(media)}#t=2`} height={100} width={100} className="h-[100px] w-[100px] object-cover" aria-label={name || 'Ad media video'} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getMediaSrc(media)} alt={name || 'Ad media image'} className="h-[100px] w-[100px] object-contain" />
                )}
              </div>
            ) : (
              <div className="mb-3 rounded bg-gray-50 px-3 py-2 text-sm italic text-gray-500">No media selected</div>
            )}
            <ImageSelector
              medias={adMedias}
              preSelected={media}
              onImageSelected={(uuid: string) => setMedia(uuid)}
              refreshMedia={fetchMedia}
              isUploader
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={editMode ? update : create}
              disabled={overlay}
              className="rounded bg-[#1565C0] px-8 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {editMode ? 'Update' : 'Save'}
            </button>
            <button onClick={done} className="rounded bg-gray-200 px-8 py-2.5 font-semibold text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChipCombobox({
  label,
  field,
  chips,
  onAdd,
  onRemove,
  aiLabel,
  onAi,
  aiLoading,
}: {
  label: string
  field: ChipField
  chips: string[]
  onAdd: (field: ChipField, value: string) => void
  onRemove: (field: ChipField, index: number) => void
  aiLabel?: string
  onAi?: () => void
  aiLoading?: boolean
}) {
  const [input, setInput] = useState('')
  const commit = () => {
    onAdd(field, input)
    setInput('')
  }
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {chips.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            <span key={i} title={chip} className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#fb0062] px-3 py-1 text-sm text-white">
              <span className="truncate">{chip}</span>
              <button onClick={() => onRemove(field, i)} className="text-white/80 hover:text-white" aria-label={`Remove ${chip}`}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className={FIELD}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
          placeholder={`Add ${label.toLowerCase()} and press Enter`}
        />
        <button type="button" onClick={commit} className="shrink-0 rounded bg-[#1565C0] px-4 py-2.5 text-sm font-medium text-white">
          Add
        </button>
        {onAi && (
          <button
            type="button"
            onClick={onAi}
            disabled={aiLoading}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded bg-[#1565C0] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            aria-label={`Generate ${label} with AI`}
          >
            <RefreshCw size={16} className={aiLoading ? 'animate-spin' : ''} />
            {aiLabel}
          </button>
        )}
      </div>
    </div>
  )
}
