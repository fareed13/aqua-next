'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useContentBuilder } from '@/hooks/admin/useContentBuilder'
import { ImageSelector } from '@/components/ImageSelector'
import { Autocomplete, MultiCombobox, FIELD_CLASS, LABEL_CLASS } from '@/components/form/Combobox'
import { buildMediaUrl, isVideoMedia } from '@/lib/utils/media'
import type { Service } from '@/types/api'

interface Props {
  /** Omit for Add mode — mirrors Nuxt passing no service_id_prop on /classes. */
  serviceId?: number
}

interface Named { name: string }
interface ServiceIntro { content: string; service_types: string[] }
interface MediaItem { uuid: string; name: string; extension: string }

/**
 * Add/Edit Service dialog — ports Nuxt components/service/ServiceAddEdit.vue.
 *
 * Nuxt derives editMode from whether service_id_prop was passed: classes/[slug]
 * passes the current service (Edit), /classes passes nothing (Add). Same here.
 */
export function ServiceEdit({ serviceId }: Props) {
  const editMode = serviceId != null
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const services = useOrgStore(s => s.organization?.services ?? [])
  const { getSecure, putSecure, postSecure } = useSecureCalls()
  const { fetchMediaByOrganization } = useContentBuilder()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reference data (Nuxt: fetchTopics / fetchServiceTypes / fetchServiceIntro / fetchMedia)
  const [topics, setTopics] = useState<Named[]>([])
  const [serviceTypes, setServiceTypes] = useState<Named[]>([])
  const [allServiceIntro, setAllServiceIntro] = useState<ServiceIntro[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])

  // Form fields — same 15 v-models as Nuxt.
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [type, setType] = useState('')
  const [serviceIntro, setServiceIntro] = useState('')
  const [parentServiceId, setParentServiceId] = useState<number | ''>('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [largeMedia, setLargeMedia] = useState('')
  const [shortDescription, setShortDescription] = useState('')

  // Nuxt hardcodes this list in the component (tags = ref([...])).
  const TAGS = ['fitness_arts', 'kids_arts', 'long_jump', 'body_building']

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetchMediaByOrganization()
      setMedia(Array.isArray(res) ? (res as MediaItem[]) : [])
    } catch {
      /* Nuxt swallows this too */
    }
  }, [fetchMediaByOrganization])

  // Nuxt loads reference data + the service in onMounted AND on every popup
  // toggle; fetching when the dialog opens covers both and avoids doing admin
  // API calls for visitors who never open it.
  useEffect(() => {
    if (!open) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const [t, st, si] = await Promise.all([
          getSecure<Named[]>(SECURE_ENDPOINTS.SERVICE_TOPIC),
          getSecure<Named[]>(SECURE_ENDPOINTS.SERVICE_TYPE),
          getSecure<ServiceIntro[]>(SECURE_ENDPOINTS.SERVICE_INTRO),
        ])
        if (cancelled) return
        setTopics(t ?? [])
        setServiceTypes(st ?? [])
        setAllServiceIntro(si ?? [])
        await fetchMedia()

        // Add mode has nothing to load — reference data is enough.
        if (!editMode) return

        const res = await getSecure<Service[]>(SECURE_ENDPOINTS.GET_SERVICES, { id: serviceId })
        const s = res?.[0]
        if (cancelled || !s) return
        const svc = s as Service & {
          headline?: string
          service_intro?: string
          topics?: string[]
          tags?: string[]
          parentService?: { id: number } | null
          large_media?: unknown
        }
        setName(svc.name ?? '')
        setHeadline(svc.headline ?? '')
        setType((svc as { type?: string }).type ?? '')
        setServiceIntro(svc.service_intro ?? '')
        setMinAge(svc.min_age != null ? String(svc.min_age) : '')
        setMaxAge(svc.max_age != null ? String(svc.max_age) : '')
        setShortDescription(svc.short_description ?? '')
        // large_media may arrive as a media object or a bare uuid.
        const lm = svc.large_media as { uuid?: string } | string | null | undefined
        setLargeMedia(typeof lm === 'string' ? lm : lm?.uuid ?? '')
        setParentServiceId(svc.parentService?.id ?? '')
        setSelectedTopics([...(svc.topics ?? [])])
        setSelectedTags([...(svc.tags ?? [])])
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [open, serviceId, editMode, getSecure, fetchMedia])

  // Nuxt: only intros whose service_types include the chosen type.
  const filteredServiceIntro = type
    ? allServiceIntro.filter(si => si.service_types?.some(st => st === type))
    : []

  /** Nuxt uses slugify(text, { remove: /[/]/g, lower: true }); it isn't a dep here. */
  const createSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/\//g, '')
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

  // Nuxt: limitTopicSelector pops the extra and toasts.
  const onTopicsChange = (next: string[]) => {
    if (next.length > 2) {
      toast('You can only select two', { duration: 5000 })
      next = next.slice(0, 2)
    }
    setSelectedTopics(next)
  }

  // Nuxt's cancel() clears every field before closing, so a reopened Add dialog
  // starts empty rather than showing the last attempt.
  const cancel = () => {
    setName('')
    setHeadline('')
    setType('')
    setServiceIntro('')
    setParentServiceId('')
    setMinAge('')
    setMaxAge('')
    setSelectedTopics([])
    setSelectedTags([])
    setLargeMedia('')
    setShortDescription('')
    setOpen(false)
  }

  const save = async () => {
    // Nuxt validates name, type, short_description and large_media as required.
    if (!name || !type || !shortDescription || !largeMedia) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }
    setLoading(true)
    const common = {
      name,
      headline,
      type,
      organization: organization?.id,
      location_id: location?.id,
      min_age: minAge === '' ? null : Number(minAge),
      max_age: maxAge === '' ? null : Number(maxAge),
      parent_service_id: parentServiceId === '' ? null : parentServiceId,
      topics: selectedTopics,
      short_description: shortDescription,
      large_media: largeMedia,
      tags: selectedTags,
      service_intro: serviceIntro,
      slug: createSlug(name),
    }
    try {
      if (editMode) {
        await putSecure(SECURE_ENDPOINTS.GET_SERVICES, { id: serviceId, ...common })
        toast.success('Service Updated Successfuly', { duration: 15000 })
      } else {
        // Nuxt's create() adds order: 999 and an empty content array.
        await postSecure(SECURE_ENDPOINTS.GET_SERVICES, { order: 999, content: [], ...common })
        toast.success('Service Created Successfuly', { duration: 15000 })
      }
      cancel()
      router.refresh()
    } catch (error) {
      console.error(error)
      cancel()
    } finally {
      setLoading(false)
    }
  }

  const field = FIELD_CLASS
  const label = LABEL_CLASS

  // Nuxt renders the chosen media in the `selection` slot of the readonly
  // "Select large media" v-select; the picker below it does the actual choosing.
  const selectedMedia = media.find(m => m.uuid === largeMedia)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-white px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide"
        style={{ backgroundColor: '#124e66' }}
      >
        {editMode ? 'Edit Service' : 'Add Service'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[1100px] max-h-[90vh] overflow-y-auto shadow-xl relative">
            {loading && (
              <div className="absolute inset-0 z-[99] bg-white/70 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div className="p-4">
              <h1 className="text-4xl sm:text-5xl font-normal text-black ml-4 mt-4">
                {editMode ? 'Edit Service' : 'Add Service'}
              </h1>
            </div>

            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className={label}>Name *</label>
                <input className={field} value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div>
                <label className={label}>Headline</label>
                <input className={field} value={headline} onChange={e => setHeadline(e.target.value)} />
              </div>

              <Autocomplete
                label="Type"
                required
                items={serviceTypes.map(st => st.name)}
                value={type}
                onChange={next => { setType(next); setServiceIntro('') }}
              />

              {/* Nuxt puts mb-12 on this v-select, opening a deliberate gap
                  before the tabs card. */}
              <div className="mb-12">
                <label className={label}>Service Intro</label>
                <select className={field} value={serviceIntro} onChange={e => setServiceIntro(e.target.value)}>
                  <option value="">Select an intro</option>
                  {filteredServiceIntro.map(si => (
                    <option key={si.content} value={si.content}>{si.content}</option>
                  ))}
                </select>
              </div>

              {/* Nuxt wraps the rest in a v-card + `<v-tabs grow>` holding a
                  single tab, so the header is a full-width active tab. */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="flex border-b border-gray-200">
                  <span className="flex-1 px-4 py-4 text-center text-sm font-medium uppercase tracking-wide text-[#124e66] border-b-2 border-[#124e66]">
                    Additional information
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  {services.length > 0 && (
                    <div>
                      <label className={label}>Parent service</label>
                      <select
                        className={field}
                        value={parentServiceId}
                        onChange={e => setParentServiceId(e.target.value === '' ? '' : Number(e.target.value))}
                      >
                        <option value="">None</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={label}>Minimum age</label>
                      <input type="number" className={field} value={minAge} onChange={e => setMinAge(e.target.value)} />
                    </div>
                    <div>
                      <label className={label}>Maximum age</label>
                      <input type="number" className={field} value={maxAge} onChange={e => setMaxAge(e.target.value)} />
                    </div>
                  </div>

                  {/* Nuxt: v-combobox, no `chips` — selections show as comma text. */}
                  <MultiCombobox
                    label="Select topics"
                    items={topics.map(t => t.name)}
                    value={selectedTopics}
                    onChange={onTopicsChange}
                    hint="Maximum of 2 topics"
                  />

                  {/* Nuxt: v-combobox with `chips`. */}
                  <MultiCombobox
                    label="Select tags"
                    items={TAGS}
                    value={selectedTags}
                    onChange={setSelectedTags}
                    chips
                  />

                  <div>
                    <label className={label}>Select large media *</label>
                    <div className="w-full border border-gray-300 rounded px-3 py-2 min-h-[120px] flex items-center justify-center bg-white">
                      {selectedMedia ? (
                        isVideoMedia(selectedMedia) ? (
                          // #t=2 seeks to 2s so the frame isn't a black lead-in.
                          <video
                            src={`${buildMediaUrl(selectedMedia, 700)}#t=2`}
                            width={100}
                            height={100}
                            className="object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- admin-only preview; matches ImageSelector's thumbs
                          <img
                            src={buildMediaUrl(selectedMedia, 700)}
                            alt={selectedMedia.name || 'Service media preview'}
                            className="h-[100px] w-auto max-w-full object-contain"
                          />
                        )
                      ) : (
                        <span className="text-sm text-gray-400">No media selected</span>
                      )}
                    </div>
                  </div>

                  <ImageSelector
                    medias={media}
                    preSelected={largeMedia}
                    onImageSelected={(uuid: string) => setLargeMedia(uuid)}
                    refreshMedia={fetchMedia}
                    isUploader
                  />

                  <div>
                    <label className={label}>Short description *</label>
                    <input
                      className={field}
                      maxLength={500}
                      value={shortDescription}
                      onChange={e => setShortDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={save}
                disabled={loading}
                className="bg-gray-900 text-white px-6 py-2 rounded font-semibold text-sm uppercase disabled:opacity-50"
              >
                {editMode ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={cancel}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-semibold text-sm uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
