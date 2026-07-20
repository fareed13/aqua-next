'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Megaphone, Settings, Plus, Menu, Trash2, RefreshCw, Save, X, ArrowLeft } from 'lucide-react'
import { useOrgStore, useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useAdminMediaCrud } from '@/hooks/admin/useAdminMedia'
import { ImageSelector } from '@/components/ImageSelector'
import { AdLibrary, type AdTemplate } from './AdLibrary'
import { EditChipValue } from './EditChipValue'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? MEDIA_URL

const AD_TYPE_OPTIONS = ['A/B Test Ads', 'Basic Ad']
const CALL_TO_ACTION_TYPES = ['SIGN_UP', 'LEARN_MORE', 'SEND_MESSAGE']

interface FacebookAddEditProps {
  adsId?: string
  /** When rendered inline (e.g. from FacebookAdsList inside the settings accordion),
   *  Save/Cancel close the inline view instead of routing to /admin/all-settings. */
  onClose?: () => void
}

interface AdMedia {
  uuid: string
  name: string
  extension: string
  media_type?: string
  topics?: Array<string | { name: string }>
  organization?: number
}

interface AudienceOption {
  id: number
  name: string
  pixel_id?: string | null
}

interface AdItem {
  primary_text_list: string[]
  headline_list: string[]
  content_list: string[]
  selectedMedia: string[]
  thumbnail_id: number | null
  selectedThumbnail: string | null
  path_url: string | string[] | null
  media_is_video: boolean
}

interface AiTextResponse {
  completion: string
}

const defaultAdItem = (): AdItem => ({
  primary_text_list: [],
  headline_list: [],
  content_list: [],
  selectedMedia: [],
  thumbnail_id: null,
  selectedThumbnail: null,
  path_url: null,
  media_is_video: false,
})

function topicName(t: string | { name: string }): string {
  return typeof t === 'string' ? t : t?.name
}

/** Free-text multi-chip input mirroring Nuxt's `v-combobox multiple chips` plus an
 *  AI-generate button. Clicking a chip opens EditChipValue to edit it. */
function ChipInput({
  label,
  values,
  onChange,
  loading,
  onAiGenerate,
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  loading: boolean
  onAiGenerate: () => void
}) {
  const [input, setInput] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const add = () => {
    const v = input.trim()
    if (!v) return
    onChange([...values, v])
    setInput('')
  }
  const remove = (i: number) => onChange(values.filter((_, x) => x !== i))
  const applyEdit = (v: string) => {
    if (editIndex === null) return
    onChange(values.map((c, x) => (x === editIndex ? v : c)))
  }

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-start gap-2">
        <div className="flex-1 rounded border border-gray-300 bg-white p-2">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {values.map((c, i) => (
              <span
                key={i}
                onClick={() => setEditIndex(i)}
                className="inline-flex max-w-full cursor-pointer items-center gap-1 rounded-full bg-[#e6edfd] px-2.5 py-1 text-[13px] text-[#2a4d9b]"
                title="Click to edit"
              >
                <span className="truncate">{c}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(i)
                  }}
                  aria-label={`Remove ${c}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            onBlur={add}
            placeholder={`Add ${label.toLowerCase()} and press Enter`}
            className="w-full text-sm outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onAiGenerate}
          disabled={loading}
          title={`Get AI Generated ${label}`}
          aria-label={`Get AI generated ${label.toLowerCase()}`}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded text-[#1565C0] hover:bg-blue-50 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <EditChipValue
        open={editIndex !== null}
        value={editIndex !== null ? values[editIndex] ?? '' : ''}
        onUpdate={applyEdit}
        onClose={() => setEditIndex(null)}
      />
    </div>
  )
}

export function FacebookAddEdit({ adsId, onClose }: FacebookAddEditProps) {
  const router = useRouter()
  const organization = useOrgStore((s) => s.organization)
  const services = useOrgServices()
  const { getSecure, postSecure } = useSecureCalls()
  const { fetchMediaByOrganization } = useAdminMediaCrud()

  const editMode = !!adsId

  const [navBar, setNavBar] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const [overlay1, setOverlay1] = useState(false)

  const [selectedAdType, setSelectedAdType] = useState('')
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [audiences, setAudiences] = useState<AudienceOption[]>([])
  const [selectedAudKey, setSelectedAudKey] = useState('')
  const [leadCount, setLeadCount] = useState<number | ''>('')
  const monthlyBudget = typeof leadCount === 'number' ? leadCount * 15 : 0

  const [adsListObject, setAdsListObject] = useState<AdItem[]>([defaultAdItem(), defaultAdItem()])
  // Each successive library pick fills the next A/B ad slot (mirrors Nuxt draggedData index).
  const draggedCountRef = useRef(0)

  // Basic Ad fields
  const [titles, setTitles] = useState<string[]>([])
  const [bodies, setBodies] = useState<string[]>([])
  const [descriptions, setDescriptions] = useState<string[]>([])
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [selectedCallToActionType, setSelectedCallToActionType] = useState('SIGN_UP')

  const [adMedias, setAdMedias] = useState<AdMedia[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [targetedIndex, setTargetedIndex] = useState('')

  // --- audience list (pixel-derived custom audiences + fetched target audiences) ---
  const filteredAudiences = useMemo<AudienceOption[]>(() => {
    const pixel = organization?.pixel
    if (pixel && pixel.length) {
      const pixelAudiences: AudienceOption[] = pixel.map((p, i) => ({
        name: `Custom audience ${i + 1} Pixel (${p})`,
        id: -1,
        pixel_id: p,
      }))
      return [...pixelAudiences, ...audiences]
    }
    return audiences
  }, [organization?.pixel, audiences])

  const audKey = (a: AudienceOption) => (a.id === -1 ? `pixel-${a.pixel_id}` : `aud-${a.id}`)
  const audience = filteredAudiences.find((a) => audKey(a) === selectedAudKey) ?? null

  const fetchMedia = useCallback(async () => {
    try {
      const res = (await fetchMediaByOrganization()) as AdMedia[]
      const list = Array.isArray(res) ? res : []
      setAdMedias(list.filter((m) => m.topics?.some((t) => topicName(t) === 'Ad')))
    } catch {
      /* ignore */
    }
  }, [fetchMediaByOrganization])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Load target audiences whenever the program changes (Nuxt watch on selectedService).
  useEffect(() => {
    if (selectedService === null) return
    ;(async () => {
      try {
        setOverlay1(true)
        const res = await getSecure<AudienceOption[]>(SECURE_ENDPOINTS.TARGET_AUDIENCE, {
          service_id: selectedService,
        })
        setAudiences(Array.isArray(res) ? res : [])
      } catch {
        /* handled */
      } finally {
        setOverlay1(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService])

  // --- media helpers ---
  const isVideo = (m: AdMedia) => m.extension === 'mp4' || m.media_type === 'video'
  const getMediaSrc = (uuid: string | null | undefined): string => {
    if (!uuid) return ''
    const m = adMedias.find((x) => x.uuid === uuid)
    if (!m) return ''
    const base = isVideo(m) ? VIDEO_URL : MEDIA_URL
    return `${base}/${m.uuid}_1000.${m.extension}`
  }

  const getMediaUrls = (mediaList: string[]) => {
    if (!mediaList || !mediaList.length) return { urls: [] as string[], is_video: false, isValid: false }
    const first = adMedias.find((m) => m.uuid === mediaList[0])
    if (!first) return { urls: [] as string[], is_video: false, isValid: false }
    const vid = isVideo(first)
    const urls: string[] = []
    let isValid = true
    for (const uuid of mediaList) {
      const m = adMedias.find((x) => x.uuid === uuid)
      if (!m) continue
      if (isVideo(m) !== vid) isValid = false
      urls.push(`${isVideo(m) ? VIDEO_URL : MEDIA_URL}/${m.uuid}_1000.${m.extension}`)
    }
    return { urls, is_video: vid, isValid }
  }

  // --- ad list mutations ---
  const updateAdItem = (index: number, patch: Partial<AdItem>) => {
    setAdsListObject((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const addAdToList = () => setAdsListObject((prev) => [...prev, defaultAdItem()])
  const removeAdFromList = (index: number) => {
    setAdsListObject((prev) => {
      if (prev.length <= 2) {
        toast.error('Minimum 2 ads are required.', { duration: 2000 })
        return prev
      }
      toast.error('ad removed', { duration: 2000 })
      return prev.filter((_, i) => i !== index)
    })
  }

  // --- ad library ---
  const addToContent = (ev: AdTemplate, index?: number) => {
    if (!ev) return
    if (index !== undefined) {
      const newObj: AdItem = {
        primary_text_list: ev.primary_texts ?? [],
        headline_list: ev.titles ?? [],
        content_list: ev.contents ?? [],
        selectedMedia: ev.media ? [ev.media.uuid] : [],
        thumbnail_id: null,
        selectedThumbnail: null,
        path_url: getMediaSrc(ev.media ? ev.media.uuid : null),
        media_is_video: false,
      }
      setAdsListObject((prev) => prev.map((it, i) => (i === index ? newObj : it)))
    } else {
      setTitles(ev.titles ?? [])
      setBodies(ev.primary_texts ?? [])
      setDescriptions(ev.contents ?? [])
      setSelectedMedia(ev.media ? [ev.media.uuid] : [])
      setSelectedCallToActionType('SIGN_UP')
    }
  }

  const handleDataUpdate = (ad: AdTemplate) => {
    if (selectedAdType === 'A/B Test Ads') {
      addToContent(ad, draggedCountRef.current)
      draggedCountRef.current += 1
    } else if (selectedAdType === 'Basic Ad') {
      addToContent(ad)
    }
  }

  // --- AI text generation ---
  const getAIGeneratedAdText = async (textFor: 'titles' | 'contents' | 'primary_texts', i: number | null) => {
    try {
      setAiLoading(true)
      setTargetedIndex(i !== null ? `${textFor}_${i}` : textFor)
      const res = await postSecure<AiTextResponse>(SECURE_ENDPOINTS.AD_TEXT, { text_for: textFor })
      const completion = res?.completion ?? ''
      if (textFor === 'titles') {
        if (i !== null) updateAdItem(i, { headline_list: [...adsListObject[i].headline_list, completion] })
        else setTitles((prev) => [...prev, completion])
      } else if (textFor === 'contents') {
        if (i !== null) updateAdItem(i, { content_list: [...adsListObject[i].content_list, completion] })
        else setDescriptions((prev) => [...prev, completion])
      } else {
        if (i !== null) updateAdItem(i, { primary_text_list: [...adsListObject[i].primary_text_list, completion] })
        else setBodies((prev) => [...prev, completion])
      }
    } catch {
      toast.error('AI Text generation failed, Try to add manually.')
    } finally {
      setAiLoading(false)
      setTargetedIndex('')
    }
  }

  const goBack = () => {
    if (onClose) onClose()
    else router.push('/admin/all-settings')
  }

  const create = async () => {
    if (selectedService === null || !audience || !selectedAdType) return
    try {
      setOverlay(true)
      let createObj: Record<string, unknown>
      if (selectedAdType === 'A/B Test Ads') {
        const validated = adsListObject.map((item) => ({ item, v: getMediaUrls(item.selectedMedia) }))
        if (validated.some(({ v }) => !v.isValid)) {
          toast.info('Every Ad should contains only images or videos but not both', { duration: 5000 })
          setOverlay(false)
          return
        }
        createObj = {
          service_id: selectedService,
          audience_id: audience.id,
          pixel_id: audience.pixel_id ?? null,
          ads_data: validated.map(({ item, v }) => ({ ...item, media_is_video: v.is_video, path_url: v.urls })),
          monthly_budget: monthlyBudget,
          ad_type: selectedAdType,
        }
      } else {
        const validated = getMediaUrls(selectedMedia)
        if (!validated.isValid) {
          toast.info('Every Ad should contains only images or videos but not both', { duration: 5000 })
          setOverlay(false)
          return
        }
        createObj = {
          service_id: selectedService,
          audience_id: audience.id,
          pixel_id: audience.pixel_id ?? null,
          titles,
          bodies,
          descriptions,
          call_to_action_type: selectedCallToActionType,
          media_is_video: validated.is_video,
          path_url: validated.urls,
          monthly_budget: monthlyBudget,
          ad_type: selectedAdType,
        }
      }
      await postSecure(SECURE_ENDPOINTS.FB_ADS, createObj)
      toast.success('Facebook Ads created Successfully', { duration: 3000 })
      setOverlay(false)
      goBack()
    } catch {
      setOverlay(false)
    }
  }

  const renderMediaTiles = (uuids: string[]) => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {uuids.map((m, j) => {
        const media = adMedias.find((am) => am.uuid === m)
        const src = getMediaSrc(m)
        return media && isVideo(media) ? (
          <video key={j} src={`${src}#t=2`} controls className="h-[200px] w-full rounded border border-gray-200 object-cover sm:h-[150px]" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={j} src={src} alt="Please select a media" className="h-[200px] w-full rounded border border-gray-200 object-cover sm:h-[150px]" />
        )
      })}
    </div>
  )

  const saveDisabled = selectedService === null || !audience || selectedAdType === ''

  return (
    <div className="relative min-h-full bg-[#f8fafc]">
      {/* Ad Library slide-out drawer */}
      {navBar && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setNavBar(false)} />
          <div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-[350px] shadow-xl"
            style={{ background: organization?.colors?.['app-main-accent-color'] ?? '#124e66' }}
          >
            <button
              onClick={() => setNavBar(false)}
              aria-label="Close ad library"
              className="absolute right-2 top-2 z-10 rounded p-1 text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>
            <AdLibrary onDataUpdated={handleDataUpdate} />
          </div>
        </>
      )}

      {/* Loading overlays */}
      {(overlay || overlay1) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="bg-[#124e66] p-4">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {onClose && (
              <button onClick={onClose} aria-label="Back" className="rounded p-1 text-white hover:bg-white/10">
                <ArrowLeft size={22} />
              </button>
            )}
            <Megaphone size={30} className="text-white" />
            <div>
              <h1 className="text-xl font-medium text-white md:text-2xl">{editMode ? 'Edit Ad' : 'Create Ad'}</h1>
              <p className="text-sm text-white/70">
                {editMode ? 'Update ad configuration' : 'Create new Facebook ad campaign'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-2 py-4 sm:px-4">
        <div className="rounded border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b bg-gray-50 px-5 py-3 font-semibold">
            <Settings size={18} /> Ad Configuration
          </div>

          <div className="p-4 sm:p-6">
            {/* Basic Settings */}
            <div className="mb-6">
              <h4 className="mb-3 text-base font-medium">Basic Settings</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Choose an Ad Type</label>
                  <select
                    value={selectedAdType}
                    onChange={(e) => setSelectedAdType(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2.5"
                  >
                    <option value="">Choose an Ad Type</option>
                    {AD_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Choose a program</label>
                  <select
                    value={selectedService ?? ''}
                    onChange={(e) => {
                      setSelectedService(e.target.value ? Number(e.target.value) : null)
                      setSelectedAudKey('')
                    }}
                    className="w-full rounded border border-gray-300 px-3 py-2.5"
                  >
                    <option value="">Choose a program</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Choose target market</label>
                <select
                  value={selectedAudKey}
                  disabled={selectedService === null}
                  onChange={(e) => setSelectedAudKey(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2.5 disabled:bg-gray-100"
                >
                  <option value="">Choose target market</option>
                  {filteredAudiences.map((a) => (
                    <option key={audKey(a)} value={audKey(a)}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="mb-6">
              <h4 className="mb-3 text-base font-medium">Campaign Details</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Number of leads</label>
                  <input
                    type="number"
                    min={3}
                    value={leadCount}
                    onChange={(e) => setLeadCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-3 py-2.5"
                  />
                  {leadCount !== '' && leadCount < 3 && (
                    <p className="mt-1 text-xs text-red-600">Number of leads should be greater or equal than 3</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Monthly budget</label>
                  <input
                    type="number"
                    disabled
                    value={monthlyBudget}
                    className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              {selectedAdType === 'A/B Test Ads' ? (
                <div className="flex flex-col items-center">
                  <button
                    onClick={addAdToList}
                    aria-label="Add ad to A/B test list"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow hover:bg-green-700"
                  >
                    <Plus size={24} />
                  </button>
                  <span className="mt-1 text-xs text-gray-600">Add Ad</span>
                </div>
              ) : (
                <div />
              )}
              <button
                onClick={() => setNavBar((v) => !v)}
                aria-label="Open ad library"
                className="inline-flex items-center gap-2 rounded-full bg-[#1565C0] px-5 py-2.5 font-medium text-white hover:bg-[#0e4a94]"
              >
                <Menu size={18} /> Ad Library
              </button>
            </div>

            {/* A/B Test Ads */}
            {selectedAdType === 'A/B Test Ads' && (
              <div className="mb-4">
                <h4 className="mb-4 text-base font-medium">A/B Test Ads</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {adsListObject.map((item, i) => (
                    <div key={i} className="rounded border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-medium">Ad {i + 1}</span>
                        <button
                          onClick={() => removeAdFromList(i)}
                          aria-label={`Remove ad ${i + 1}`}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mb-4">{renderMediaTiles(item.selectedMedia)}</div>

                      <div className="mb-4 rounded border border-dashed border-gray-300 bg-gray-50 p-3">
                        <ImageSelector
                          medias={adMedias}
                          isMulti
                          isUploader
                          preSelected={item.selectedMedia}
                          refreshMedia={fetchMedia}
                          onImageSelected={(data: string[]) => updateAdItem(i, { selectedMedia: data })}
                        />
                      </div>

                      <ChipInput
                        label="Title"
                        values={item.headline_list}
                        onChange={(v) => updateAdItem(i, { headline_list: v })}
                        loading={aiLoading && targetedIndex === `titles_${i}`}
                        onAiGenerate={() => getAIGeneratedAdText('titles', i)}
                      />
                      <ChipInput
                        label="Sales Pitch"
                        values={item.content_list}
                        onChange={(v) => updateAdItem(i, { content_list: v })}
                        loading={aiLoading && targetedIndex === `contents_${i}`}
                        onAiGenerate={() => getAIGeneratedAdText('contents', i)}
                      />
                      <ChipInput
                        label="Call to Action"
                        values={item.primary_text_list}
                        onChange={(v) => updateAdItem(i, { primary_text_list: v })}
                        loading={aiLoading && targetedIndex === `primary_texts_${i}`}
                        onAiGenerate={() => getAIGeneratedAdText('primary_texts', i)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Ad */}
            {selectedAdType === 'Basic Ad' && (
              <div className="mb-4">
                <h4 className="mb-4 text-base font-medium">Basic Ad</h4>
                <div className="rounded border border-gray-200 p-4">
                  <div className="mb-4">{renderMediaTiles(selectedMedia)}</div>

                  <div className="mb-4 rounded border border-dashed border-gray-300 bg-gray-50 p-3">
                    <ImageSelector
                      medias={adMedias}
                      isMulti
                      isUploader
                      preSelected={selectedMedia}
                      refreshMedia={fetchMedia}
                      onImageSelected={(data: string[]) => setSelectedMedia(data)}
                    />
                  </div>

                  <ChipInput
                    label="Title"
                    values={titles}
                    onChange={setTitles}
                    loading={aiLoading && targetedIndex === 'titles'}
                    onAiGenerate={() => getAIGeneratedAdText('titles', null)}
                  />
                  <ChipInput
                    label="Call to Action"
                    values={bodies}
                    onChange={setBodies}
                    loading={aiLoading && targetedIndex === 'primary_texts'}
                    onAiGenerate={() => getAIGeneratedAdText('primary_texts', null)}
                  />
                  <ChipInput
                    label="Sales Pitch"
                    values={descriptions}
                    onChange={setDescriptions}
                    loading={aiLoading && targetedIndex === 'contents'}
                    onAiGenerate={() => getAIGeneratedAdText('contents', null)}
                  />

                  <div className="mb-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Call To Action</label>
                    <select
                      value={selectedCallToActionType}
                      onChange={(e) => setSelectedCallToActionType(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2.5"
                    >
                      {CALL_TO_ACTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Save */}
            {!editMode && (
              <div className="mt-8 border-t pt-4">
                <button
                  onClick={create}
                  disabled={saveDisabled || overlay}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[#1565C0] py-3 font-semibold text-white hover:bg-[#0e4a94] disabled:opacity-50"
                >
                  <Save size={18} />
                  {overlay ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
