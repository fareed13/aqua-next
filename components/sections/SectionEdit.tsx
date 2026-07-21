'use client'

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react'
import { X, Pencil, Eye, Puzzle, RefreshCw, Save, Plus, LayoutGrid, Search, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useAdminService } from '@/hooks/admin/useAdminService'
import { useContentBuilder } from '@/hooks/admin/useContentBuilder'
import { extractInnerContent, ensureContentWrapper } from '@/lib/utils/quillHelpers'
import { checkBase64, highlightBase64Images } from '@/lib/utils/base64ImgValidation'
import { QuillEditor } from '@/components/QuillEditor'
import { ImageSelector } from '@/components/ImageSelector'
import { BulletsForm } from '@/components/BulletsForm'
import { CustomBulletsForm } from '@/components/CustomBulletsForm'
import { CustomServiceVideo } from '@/components/CustomServiceVideo'
import { SectionRenderer } from './SectionRenderer'
import { PreviewBoundary } from './PreviewBoundary'
import type { ComponentContent } from '@/types/api'

export type SectionEditTarget = 'page' | 'location' | 'service'

interface Props {
  /** Which entity owns the content array — decides load/save endpoint. */
  target: SectionEditTarget
  targetId: number | string
  /** Index of the section being edited; null = add a new section. */
  sectionIndex: number | null
  onClose: () => void
  /** Called after a successful save (e.g. to update local section state). */
  onSaved?: (content: ComponentContent[]) => void
}

type Section = Record<string, any>

interface FieldDef {
  type: string
  label: string
  default: any
}

// Union of the Nuxt Page/Location/Service fieldsMaps (location adds location_selector).
const FIELDS_MAP: Record<string, FieldDef> = {
  headline: { type: 'text', label: 'Headline', default: '' },
  subtitle: { type: 'text', label: 'Subtitle', default: '' },
  content: { type: 'html', label: 'Content', default: '' },
  media: { type: 'image_selector', label: 'Media', default: [] },
  service: { type: 'service_selector', label: 'Service', default: null },
  plan: { type: 'plan_selector', label: 'Plan', default: null },
  location: { type: 'location_selector', label: 'Location', default: null },
  countOfReviews: { type: 'number', label: 'Count of Reviews', default: 0 },
  countOfPrograms: { type: 'number', label: 'Count of Programs', default: 0 },
  is_sticky: { type: 'switch', label: 'Is Sticky', default: false },
  topics: { type: 'topics_selector', label: 'Topics', default: [] },
  bullets: { type: 'bullets', label: 'Bullets', default: '' },
  backgroundImage: { type: 'backgroundImage', label: 'Background Image', default: '' },
  backgroundColor: { type: 'backgroundColor', label: 'Background Color', default: '' },
  customBullets: { type: 'custom_bullets', label: 'Custom Bullets', default: [] },
  url: { type: 'text', label: 'Url', default: '' },
  interactiveVideo: { type: 'interactive_video', label: 'Interactive Video', default: [] },
}

const TARGET_ENDPOINTS: Record<SectionEditTarget, string> = {
  page: SECURE_ENDPOINTS.PAGE,
  location: SECURE_ENDPOINTS.LOCATION,
  service: SECURE_ENDPOINTS.GET_SERVICES,
}

interface ComponentItem {
  name: string
  content_fields?: {
    fields_name?: string[]
    required_fields?: string[]
    optional_fields?: string[]
  }
}

/** Modern searchable dropdown (mirrors Nuxt's v-autocomplete for the component picker). */
function SearchableSelect({
  value,
  options,
  placeholder,
  icon,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  placeholder?: string
  icon?: React.ReactNode
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const selectedLabel = options.find(o => o.value === value)?.label
  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery('') }}
        className={`w-full flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-left bg-white transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#124e66]/30 ${open ? 'ring-2 ring-[#124e66]/30 border-[#124e66]' : ''}`}
      >
        {icon && <span className="text-gray-500 flex-shrink-0">{icon}</span>}
        <span className={`flex-1 truncate ${selectedLabel ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedLabel ?? placeholder ?? 'Select…'}
        </span>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full border border-gray-200 rounded-md pl-8 pr-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#124e66]/30"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
            )}
            {filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); setQuery('') }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[#124e66]/5 ${opt.value === value ? 'text-[#124e66] font-medium bg-[#124e66]/5' : 'text-gray-700'}`}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.value === value && <Check size={16} className="text-[#124e66] flex-shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function SectionEdit({ target, targetId, sectionIndex, onClose, onSaved }: Props) {
  const organization = useOrgStore(s => s.organization)
  const locations = useOrgStore(s => s.locations)
  const { isSuperAdminLoggedIn } = useAuth()
  const { getSecure, putSecure, postSecure } = useSecureCalls()
  const { topics, fetchTopics } = useAdminService()
  const { baseImageUrl, baseVideoUrl, fetchMediaByOrganization } = useContentBuilder()

  const [overlay, setOverlay] = useState(true)
  const [componentItems, setComponentItems] = useState<ComponentItem[]>([])
  const [contentList, setContentList] = useState<Section[]>([])
  const [section, setSection] = useState<Section | null>(null)
  const [editorHtml, setEditorHtml] = useState('')
  const [media, setMedia] = useState<any[]>([])
  const [backgroundMedia, setBackgroundMedia] = useState<any[]>([])
  const [aiHeadingLoading, setAiHeadingLoading] = useState(false)
  const [aiContentLoading, setAiContentLoading] = useState(false)
  const quillKey = useRef(0)

  const services = organization?.services ?? []

  const dropdownPlans = useMemo(() => {
    const plans: any[] = []
    services.forEach((service: any) => {
      service.service_plans?.forEach((plan: any) => plans.push(plan))
    })
    return plans
  }, [services])

  const getComponentConfig = useCallback((componentName?: string | null) => {
    if (!componentName || !componentItems.length) return null
    return componentItems.find(item => item.name === componentName)?.content_fields ?? null
  }, [componentItems])

  const getComponentFields = useCallback((componentName?: string | null): string[] => {
    const config = getComponentConfig(componentName)
    return Array.isArray(config?.fields_name) ? config!.fields_name! : []
  }, [getComponentConfig])

  const getOptionalFields = useCallback((componentName?: string | null): string[] => {
    const config = getComponentConfig(componentName)
    return Array.isArray(config?.optional_fields) ? config!.optional_fields! : []
  }, [getComponentConfig])

  const onComponentSelected = useCallback((componentName: string, base?: Section) => {
    const config = getComponentConfig(componentName)
    setSection(prev => {
      const current: Section = { ...(base ?? prev ?? {}), component: componentName }
      if (!config) return current
      const required = Array.isArray(config.required_fields) ? config.required_fields : []
      config.fields_name?.forEach(fieldName => {
        if (!(fieldName in current) && FIELDS_MAP[fieldName] && required.includes(fieldName)) {
          current[fieldName] = FIELDS_MAP[fieldName].default
        }
      })
      return current
    })
  }, [getComponentConfig])

  // Initial load — mirrors the Nuxt onMounted flow
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setOverlay(true)
      try {
        const [contentRes, components] = await Promise.all([
          getSecure<any[]>(TARGET_ENDPOINTS[target], { id: targetId }),
          getSecure<ComponentItem[]>(SECURE_ENDPOINTS.COMPONENT, { type: 'PageBuilder' }),
        ])
        if (cancelled) return
        const list: Section[] = contentRes?.[0]?.content ?? []
        setContentList(list)
        // The COMPONENT endpoint can return duplicate names; dedupe by name,
        // keeping the entry that actually carries field config so the picker
        // renders fields (and avoids duplicate React keys).
        const byName = new Map<string, ComponentItem>()
        for (const c of components ?? []) {
          const existing = byName.get(c.name)
          const hasFields = !!c.content_fields?.fields_name?.length
          if (!existing || (hasFields && !existing.content_fields?.fields_name?.length)) {
            byName.set(c.name, c)
          }
        }
        setComponentItems(Array.from(byName.values()))

        if (sectionIndex !== null && list[sectionIndex]) {
          const selected = { ...list[sectionIndex] }
          setSection(selected)
          setEditorHtml(selected.content ? extractInnerContent(selected.content) : '')
          quillKey.current++
        } else {
          setSection({ component: null })
          setEditorHtml('')
        }

        fetchTopics()
        fetchMediaByOrganization().then((m: any) => { if (!cancelled) setMedia(m ?? []) }).catch(() => {})
        getSecure<any[]>(SECURE_ENDPOINTS.BACKGROUND).then(res => {
          if (cancelled) return
          setBackgroundMedia((res ?? []).map((lbg: any) => ({
            uuid: lbg.slug,
            name: lbg.name,
            extension: lbg.slug?.split('.')[1],
          })))
        }).catch(() => {})
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) setOverlay(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [target, targetId, sectionIndex])

  // Once components are loaded, auto-add required fields for a pre-selected component
  useEffect(() => {
    if (componentItems.length && section?.component) {
      onComponentSelected(section.component)
    }
  }, [componentItems.length])

  const setField = (field: string, value: any) => {
    setSection(prev => (prev ? { ...prev, [field]: value } : prev))
  }

  const showMediaValue = (value: any[]): string[] => {
    return (value ?? []).map((v: any) => {
      const baseUrl = v.extension === 'mp4' ? baseVideoUrl : baseImageUrl
      const res = media.find((m: any) => m.uuid === v.name)
      return res
        ? `${baseUrl}/${res.uuid}_700.${res.extension}`
        : `${baseUrl}/${v.name}_700.${v.extension}`
    })
  }

  const onMediaSelected = (uuids: string[]) => {
    const key: any[] = []
    uuids.forEach(uuid => {
      const targetedMedia = media.find((m: any) => m.uuid === uuid)
      if (targetedMedia) {
        key.push({
          name: targetedMedia.uuid,
          type: targetedMedia.media_type,
          extension: targetedMedia.extension,
        })
      }
    })
    return key
  }

  const validateSection = (s: Section): boolean => {
    if (s.component === 'InteractiveVideo') {
      if (!s.interactiveVideo || s.interactiveVideo.length === 0) {
        toast.error('Please add at least one program', { duration: 5000 })
        return false
      }
      if (s.interactiveVideo.some((item: any) => !item.media || !item.service)) {
        toast.error('Fields are invalid or empty!', { duration: 5000 })
        return false
      }
    }
    return true
  }

  const cleanSectionForSave = (s: Section): Section => {
    if (!s?.component) return s
    const optionalFields = getOptionalFields(s.component)
    if (!optionalFields.length) return s
    const cleaned = { ...s }
    optionalFields.forEach(field => {
      if (!(field in cleaned)) return
      const value = cleaned[field]
      const isEmpty =
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && (
          value.length === 0 ||
          value.every(v => v === '' || v === null || v === undefined)
        ))
      if (isEmpty) delete cleaned[field]
    })
    return cleaned
  }

  const save = async () => {
    if (!section) return
    const isUpdate = sectionIndex !== null
    if (!isUpdate && !section.component) return
    if (!validateSection(section)) return

    const draft = { ...section }
    if (draft.content) draft.content = ensureContentWrapper(draft.content)

    if (draft.content && checkBase64(draft.content)) {
      setSection({ ...draft, content: highlightBase64Images(draft.content) })
      return
    }

    setOverlay(true)
    const content = [...contentList]
    if (isUpdate) content.splice(sectionIndex!, 1, cleanSectionForSave(draft))
    else content.push(cleanSectionForSave(draft))

    try {
      const response = await putSecure(TARGET_ENDPOINTS[target], { id: targetId, content })
      if (response !== undefined) {
        // The public pages are statically built, so a saved section only becomes
        // visible after the next deployment — say so to avoid the "why isn't it
        // showing / why did it show" confusion. See EditableSections (no optimistic update).
        toast.success(
          `${isUpdate ? 'Section updated' : 'Section added'}. It will appear on the site after the next deployment.`,
          { duration: 6000 },
        )
      }
      onSaved?.(content as ComponentContent[])
      onClose()
    } catch {
      toast.error(`Failed to ${isUpdate ? 'update' : 'add'} section. Please try again.`, { duration: 5000 })
    } finally {
      setOverlay(false)
    }
  }

  const getServiceSlug = () => {
    if (target !== 'service') return ''
    const service: any = services.find((s: any) => s.id == targetId)
    return service?.slug ?? ''
  }

  const getAIGeneratedHeadline = async (field: string) => {
    try {
      setAiHeadingLoading(true)
      const aiGeneratedText: any = await postSecure(SECURE_ENDPOINTS.AI_TEXT, {
        service_slug: getServiceSlug(),
        topics: null,
      })
      setField(field, aiGeneratedText.headline)
    } catch (e) {
      console.error(e)
      toast.error('AI Headline generation failed, Try to add manually.')
    } finally {
      setAiHeadingLoading(false)
    }
  }

  const getAIGeneratedContent = async (field: string) => {
    try {
      setAiContentLoading(true)
      const aiGeneratedText: any = await postSecure(SECURE_ENDPOINTS.AI_TEXT, {
        service_slug: getServiceSlug(),
        topics: null,
      })
      const generatedContent = ensureContentWrapper(`<div>${aiGeneratedText.completion}</div>`)
      setField(field, generatedContent)
      setEditorHtml(extractInnerContent(generatedContent))
      quillKey.current++
    } catch (e) {
      console.error(e)
      toast.error('AI content generation failed, Try to add manually.')
    } finally {
      setAiContentLoading(false)
    }
  }

  // Preview section with content wrapper applied
  const previewSection = useMemo(() => {
    if (!section?.component) return null
    const preview: Section = { ...section }
    if (preview.content) preview.content = ensureContentWrapper(preview.content)
    if (typeof preview.bullets === 'string' && preview.bullets) {
      try {
        const parsed = JSON.parse(preview.bullets)
        preview.bullets = Array.isArray(parsed) ? parsed : [preview.bullets]
      } catch {
        preview.bullets = [preview.bullets]
      }
    }
    if (preview.plan !== undefined) preview.component_plan_id = preview.plan
    return preview as ComponentContent
  }, [section])

  const topicNames = useMemo(
    () => (topics as any[]).map(t => t?.name).filter(Boolean),
    [topics],
  )

  const toggleTopic = (field: string, name: string) => {
    const current: string[] = Array.isArray(section?.[field]) ? section![field] : []
    if (current.includes(name)) {
      setField(field, current.filter(t => t !== name))
    } else {
      if (current.length >= 2) {
        toast('You can only select two', { duration: 5000 })
        return
      }
      setField(field, [...current, name])
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#124e66]/30'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const renderField = (field: string) => {
    const def = FIELDS_MAP[field]
    if (!def || !section) return null
    const value = section[field]

    switch (def.type) {
      case 'text':
        return (
          <div>
            {isSuperAdminLoggedIn() && def.label === 'Headline' && (
              <button
                type="button"
                title="Get AI Generated Headline"
                disabled={aiHeadingLoading}
                onClick={() => getAIGeneratedHeadline(field)}
                className="mb-2 text-[#124e66] disabled:opacity-50"
              >
                <RefreshCw size={18} className={aiHeadingLoading ? 'animate-spin' : ''} />
              </button>
            )}
            <label className={labelClass}>{def.label}</label>
            <input type="text" className={inputClass} value={value ?? ''} onChange={e => setField(field, e.target.value)} />
          </div>
        )
      case 'html':
        return (
          <div>
            {isSuperAdminLoggedIn() && (
              <button
                type="button"
                title="Get AI Generated Content"
                disabled={aiContentLoading}
                onClick={() => getAIGeneratedContent(field)}
                className="my-2 text-[#124e66] disabled:opacity-50"
              >
                <RefreshCw size={18} className={aiContentLoading ? 'animate-spin' : ''} />
              </button>
            )}
            <p className="mb-2 text-sm font-medium text-gray-700">{def.label}</p>
            <QuillEditor
              key={quillKey.current}
              content={editorHtml}
              theme="snow"
              toolbar="full"
              contentType="html"
              {...{
                'onUpdate:content': (html: string) => {
                  setEditorHtml(html)
                  setField('content', ensureContentWrapper(html))
                },
              }}
            />
          </div>
        )
      case 'bullets':
        return (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{def.label}</p>
            <BulletsForm
              initialBullets={Array.isArray(value) ? value : value ? [value] : []}
              onChange={bullets => setField(field, bullets)}
            />
          </div>
        )
      case 'number':
        return (
          <div>
            <label className={labelClass}>{def.label}</label>
            <input type="number" className={inputClass} value={value ?? 0} onChange={e => setField(field, e.target.value)} />
          </div>
        )
      case 'switch':
        return (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={!!value}
              onClick={() => setField(field, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-gray-700">{def.label}</span>
          </label>
        )
      case 'topics_selector': {
        const selected: string[] = Array.isArray(value) ? value : []
        return (
          <div>
            <label className={labelClass}>{def.label} <span className="text-xs text-gray-400">(max 2)</span></label>
            <div className="flex flex-wrap gap-2">
              {topicNames.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleTopic(field, name)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${selected.includes(name) ? 'bg-[#124e66] text-white border-[#124e66]' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )
      }
      case 'image_selector':
        return (
          <div className="my-2">
            <p className="mb-2 text-sm font-medium text-gray-700">{def.label}</p>
            <div className="flex flex-wrap gap-1">
              {showMediaValue(value).map((img, i) => (
                <div key={i} className="p-1" style={{ height: 100, width: 100 }}>
                  {img.includes('.mp4') ? (
                    <video src={`${img}#t=2`} style={{ height: 90, width: 100, objectFit: 'cover' }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="Section image preview" style={{ width: '100%', height: 100, objectFit: 'contain' }} />
                  )}
                </div>
              ))}
            </div>
            <hr className="my-2 border-gray-200" />
            <ImageSelector
              medias={media}
              isMulti
              isUploader
              onImageSelected={(uuids: any) => setField(field, onMediaSelected(uuids))}
              refreshMedia={async () => { const m: any = await fetchMediaByOrganization(); setMedia(m ?? []) }}
              preSelected={Array.isArray(value) ? value.map((m: any) => m.name) : []}
            />
          </div>
        )
      case 'custom_bullets':
        return (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{def.label}</p>
            <CustomBulletsForm
              initialBullets={Array.isArray(value) ? [...value] : []}
              medias={media}
              onChange={bullets => setField(field, bullets)}
            />
          </div>
        )
      case 'interactive_video':
        return (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{def.label}</p>
            <CustomServiceVideo
              initialVideo={Array.isArray(value) ? [...value] : []}
              medias={media}
              onChange={items => setField(field, items)}
            />
          </div>
        )
      case 'backgroundColor':
        return (
          <details className="border border-gray-200 rounded">
            <summary className="px-3 py-2 text-sm font-medium text-gray-700 cursor-pointer">{def.label}</summary>
            <div className="flex justify-center items-center gap-3 p-4">
              <input type="color" value={value || '#ffffff'} onChange={e => setField(field, e.target.value)} className="h-10 w-16 cursor-pointer" />
              <span className="text-sm text-gray-500">{value || 'No color selected'}</span>
            </div>
          </details>
        )
      case 'backgroundImage': {
        const bg = backgroundMedia.find((m: any) => m.uuid === value)
        return (
          <div className="my-2">
            <p className="mb-2 text-sm font-medium text-gray-700">{def.label}</p>
            {bg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${baseImageUrl}/${bg.uuid?.split('.')[0]}_700.${bg.uuid?.split('.')[1]}`}
                alt={bg.name || 'Section image'}
                style={{ width: '100%', height: 100, objectFit: 'contain' }}
                className="mb-2"
              />
            )}
            <ImageSelector
              medias={backgroundMedia}
              isUploader
              onImageSelected={(uuid: any) => setField(field, uuid)}
              preSelected={typeof value === 'string' ? value : undefined}
            />
          </div>
        )
      }
      case 'service_selector':
        return (
          <div>
            <label className={labelClass}>{def.label}</label>
            <select className={inputClass} value={value ?? ''} onChange={e => setField(field, e.target.value || null)}>
              <option value="">—</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        )
      case 'plan_selector':
        return (
          <div>
            <label className={labelClass}>{def.label}</label>
            <select className={inputClass} value={value ?? ''} onChange={e => setField(field, e.target.value ? Number(e.target.value) : null)}>
              <option value="">—</option>
              {dropdownPlans.map((item: any) => (
                <option key={item.plan.id} value={item.plan.id}>
                  {item.plan.name} (${item.plan.discounted_price ?? item.plan.price})
                </option>
              ))}
            </select>
          </div>
        )
      case 'location_selector':
        return (
          <div>
            <label className={labelClass}>{def.label}</label>
            <select className={inputClass} value={value ?? ''} onChange={e => setField(field, e.target.value ? Number(e.target.value) : null)}>
              <option value="">—</option>
              {locations.map((loc: any) => (
                <option key={loc.id} value={loc.id}>{loc.name ?? loc.city ?? loc.slug}</option>
              ))}
            </select>
          </div>
        )
      default:
        return null
    }
  }

  const fields = getComponentFields(section?.component)

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/50 p-0 md:p-4">
      <div className="relative bg-white md:rounded-lg w-full h-full md:h-auto md:max-h-[95vh] max-w-[1800px] flex flex-col shadow-2xl overflow-hidden">
        {overlay && (
          <div className="absolute inset-0 z-[99] bg-white/70 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#124e66] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Header */}
        <div className="bg-[#124e66] p-6 flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Pencil size={24} className="text-white" />
              <h1 className="text-xl text-white font-semibold leading-none m-0">
                {sectionIndex !== null ? 'Edit' : 'Add'} Section
              </h1>
            </div>
            <p className="text-sm text-white/70 mb-0 mt-1.5 pl-9">Configure your section settings and preview</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white p-1" aria-label="Close">
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {section && (
            <div className="flex flex-col-reverse md:grid md:grid-cols-12 gap-4">
              {/* Left: component + fields */}
              <div className="md:col-span-5">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                  <div className="flex items-center px-5 py-4 bg-gray-50 border-b-2 border-gray-200 font-semibold rounded-t-xl">
                    <Puzzle size={20} className="mr-2 text-[#124e66]" />
                    <span>Component</span>
                  </div>
                  <div className="p-4">
                    <SearchableSelect
                      value={section.component ?? ''}
                      placeholder="Select Component"
                      icon={<LayoutGrid size={16} />}
                      options={componentItems.map(item => ({ value: item.name, label: item.name }))}
                      onChange={val => onComponentSelected(val)}
                    />
                  </div>
                </div>

                {section.component && fields.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                    <div className="flex items-center px-5 py-4 border-b-2 font-semibold rounded-t-xl"
                      style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)', borderBottomColor: '#fecaca', color: '#991b1b' }}>
                      <span>Component Fields</span>
                      <span className="ml-2 bg-red-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5">{fields.length}</span>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                      {fields.map(field => (
                        <div key={field} className="field-content mt-2">{renderField(field)}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: live preview */}
              <div className="md:col-span-7">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm md:sticky md:top-4 max-h-[600px] overflow-y-auto">
                  <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium">
                    <Eye size={20} className="mr-2 text-[#124e66]" />
                    <p className="inline m-0">Live Preview</p>
                    <span className="ml-auto bg-[#124e66] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                      {section.component || 'No Component'}
                    </span>
                  </div>
                  <div className="p-0 flex justify-center items-center">
                    <div className="w-full">
                      {!previewSection ? (
                        <div className="w-full h-[200px] border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 font-semibold bg-gray-50 m-3">
                          <LayoutGrid size={48} className="mb-3 text-gray-300" />
                          <p>Select a component to see preview</p>
                        </div>
                      ) : (
                        <div className="overflow-hidden" style={{ minHeight: 320 }}>
                          <div
                            style={{
                              transform: 'scale(0.6)',
                              transformOrigin: 'top left',
                              width: '166.667%',
                              minHeight: 320,
                              border: '1px solid #e0e0e0',
                              background: 'white',
                              padding: 20,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                          >
                            <PreviewBoundary
                              resetKey={`${section.component}-${section.plan ?? 'none'}-${section.media?.length ?? 0}`}
                              className="w-full h-[200px] flex items-center justify-center text-sm text-gray-400 bg-gray-50 m-3"
                            >
                              <Suspense
                                fallback={
                                  <div className="w-full h-[200px] flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-[#124e66] border-t-transparent rounded-full animate-spin" />
                                  </div>
                                }
                              >
                                <SectionRenderer
                                  key={`${section.component}-${section.plan ?? 'none'}-${section.media?.length ?? 0}`}
                                  section={previewSection}
                                />
                              </Suspense>
                            </PreviewBoundary>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={save}
            disabled={overlay}
            className="inline-flex items-center gap-2 bg-[#124e66] text-white px-6 py-3 rounded font-semibold text-sm disabled:opacity-50"
          >
            {sectionIndex !== null ? <Save size={18} /> : <Plus size={18} />}
            {sectionIndex !== null ? 'Update Section' : 'Create Section'}
          </button>
        </div>
      </div>
    </div>
  )
}
