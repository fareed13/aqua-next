'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useContentBuilder } from '@/hooks/admin/useContentBuilder'
import { useAdminService } from '@/hooks/admin/useAdminService'
import { ImageSelector } from '@/components/ImageSelector'
import { BulletsForm } from '@/components/BulletsForm'
import { CustomBulletsForm } from '@/components/CustomBulletsForm'
import { FIELD_CLASS, LABEL_CLASS, MultiSelect } from '@/components/form/Combobox'
import type { ComponentContent } from '@/types/api'

interface MediaItem {
  id?: number
  uuid: string
  name: string
  extension: string
  media_type?: string
}

/**
 * A field's value is heterogeneous by design — text, number, bool, a uuid list,
 * bullets, a colour — so it stays `unknown` and is narrowed per field type.
 */
type FieldValue = unknown

/** One editable block: a component name plus an ordered list of key/value fields. */
interface TempItem {
  component: string
  fields: Array<{ key: string | null; value: FieldValue }>
}

interface Props {
  /** Existing blocks to seed the editor with (Nuxt: `:content`). */
  content: ComponentContent[]
  /** Emitted on every edit with the processed blocks (Nuxt: `update:modelValue`). */
  onChange: (processed: Array<Record<string, unknown>>) => void
}

/** Nuxt's fieldTypes list, verbatim (including the "Backgroud Color" label typo). */
const FIELD_TYPES: Array<{ title: string; value: string; type: string }> = [
  { title: 'Headline', value: 'headline', type: 'text' },
  { title: 'Subtitle', value: 'subtitle', type: 'text' },
  { title: 'Content', value: 'content', type: 'text-area' },
  { title: 'Media', value: 'media', type: 'media-select' },
  { title: 'Service', value: 'service', type: 'service-select' },
  { title: 'Amount of reviews', value: 'countOfReviews', type: 'number' },
  { title: 'Amount of programs', value: 'countOfPrograms', type: 'number' },
  { title: 'Sticky', value: 'is_sticky', type: 'switch' },
  { title: 'Topics', value: 'topics', type: 'topics-select' },
  { title: 'Bullets', value: 'bullets', type: 'bullets' },
  { title: 'Background Image', value: 'backgroundImage', type: 'background-image' },
  { title: 'Backgroud Color', value: 'backgroundColor', type: 'background-color' },
  { title: 'Custom Bullets', value: 'customBullets', type: 'custom-bullets' },
  { title: 'Url', value: 'url', type: 'text' },
]

function getFieldType(value: string | null): string | null {
  return FIELD_TYPES.find(f => f.value === value)?.type ?? null
}

/** Nuxt hides the Fields editor for the literal component named "Component". */
function showFields(name: string): boolean {
  return name !== 'Component'
}

/**
 * Shared content-block builder — ports Nuxt components/service/ContentBuilder.vue.
 *
 * Controlled: it owns the *editing* shape (an array of {component, fields[]}) but
 * never saves. It reports the processed blocks upward via onChange so the parent
 * form can put them in its own payload. This is why it can't be replaced by
 * SectionEdit, which fetches and PUTs a single section itself.
 *
 * DELIBERATE DEVIATION FROM NUXT — Nuxt's createTempContent() does
 * `const content = []` (shadowing the `content` prop) then iterates
 * `content.value`, which is undefined. That throws a TypeError outside the
 * try/catch, so in Nuxt: (1) existing blocks never load — the builder always
 * starts empty, and (2) `services = store.getServices` on the next line never
 * runs, leaving the Service dropdown empty. Worse, because the deep watcher then
 * never fires, the parent's processedContent stays [] and SAVING WIPES the
 * event's existing blocks. Replicating that would make this component useless
 * and destructive, so the intended behaviour is implemented instead.
 */
export function ContentBuilder({ content, onChange }: Props) {
  const services = useOrgServices()
  const { getSecure } = useSecureCalls()
  const { fetchMediaByOrganization } = useContentBuilder()
  const { topics: rawTopics, fetchTopics } = useAdminService()

  const [componentItems, setComponentItems] = useState<Array<{ name: string }>>([{ name: '-' }])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [backgroundMedia, setBackgroundMedia] = useState<MediaItem[]>([])
  const [tempContent, setTempContent] = useState<TempItem[]>([])

  // Keep the parent callback in a ref so emitting never depends on its identity
  // (an inline lambda from a caller would otherwise re-run the loader forever).
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange })

  const topics: string[] = (rawTopics as Array<{ name?: string } | string>)
    .map(t => (typeof t === 'string' ? t : t?.name))
    .filter((n): n is string => !!n)

  const findMedia = useCallback(
    (name: string, list: MediaItem[]) => list.find(item => item.uuid === name),
    [],
  )

  /** tempContent -> the flat blocks the backend stores (Nuxt: emitProcessedContent). */
  const process = useCallback(
    (items: TempItem[], mediaList: MediaItem[]): Array<Record<string, unknown>> => {
      const processed: Array<Record<string, unknown>> = []
      for (const { component = null, fields = [] } of items) {
        if (!component) continue
        const item: Record<string, unknown> = { component }
        for (const { key, value: raw } of fields) {
          if (!key) continue
          let value = raw
          if (key === 'backgroundColor') {
            value = value && typeof value === 'object' && 'hex' in value ? value.hex : value
          }
          if (key === 'media') {
            const mediaItems: Array<{ name: string; type?: string; extension: string }> = []
            const names: string[] = Array.isArray(value)
              ? (value as string[])
              : value ? [value as string] : []
            for (const mediaName of names) {
              const m = findMedia(mediaName, mediaList)
              if (m) mediaItems.push({ name: m.uuid, type: m.media_type, extension: m.extension })
            }
            value = mediaItems
          }
          item[key] = value
        }
        processed.push(item)
      }
      return processed
    },
    [findMedia],
  )

  /** Single write path: update local state and emit, mirroring Nuxt's deep watcher. */
  const commit = useCallback(
    (next: TempItem[]) => {
      setTempContent(next)
      onChangeRef.current(process(next, media))
    },
    [process, media],
  )

  /** Blocks -> the editing shape (Nuxt: createTempContent, minus the shadowing bug). */
  const buildTempContent = useCallback((blocks: ComponentContent[]): TempItem[] => {
    return (blocks ?? []).map(contentItem => {
      const fields = Object.entries(contentItem)
        .filter(([name]) => name !== 'component')
        .map(([key, value]) => {
          let v: FieldValue = value
          if (key === 'media' && Array.isArray(v)) v = (v as Array<{ name: string }>).map(m => m.name)
          // topics can come back as a Postgres array literal: "{a,b}"
          if (key === 'topics' && typeof v === 'string') v = v.replace(/[{}]/g, '').split(',')
          return { key, value: v }
        })
      return { component: contentItem.component || '', fields }
    })
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      let mediaList: MediaItem[] = []
      try {
        await fetchTopics()

        const mediaResp = await fetchMediaByOrganization()
        mediaList = Array.isArray(mediaResp) ? (mediaResp as MediaItem[]) : []
        if (!cancelled) setMedia(mediaList)

        // Nuxt maps the background library onto media-shaped rows: the slug is
        // both the uuid and the source of the extension.
        const bg = await getSecure<Array<{ slug: string; name: string }>>(SECURE_ENDPOINTS.BACKGROUND)
        if (!cancelled) {
          setBackgroundMedia(
            (bg ?? []).map(lbg => ({
              uuid: lbg.slug,
              name: lbg.name,
              extension: lbg.slug.split('.')[1],
            })),
          )
        }

        const response = await getSecure<Array<{ name: string }>>(SECURE_ENDPOINTS.COMPONENT, { type: 'PageBuilder' })
        if (!cancelled && Array.isArray(response)) {
          setComponentItems(
            [...response].sort((a, b) => {
              const x = a.name.toUpperCase()
              const y = b.name.toUpperCase()
              return x < y ? -1 : x > y ? 1 : 0
            }),
          )
        }
      } catch (error) {
        console.error(error)
      }

      if (cancelled) return
      const seeded = buildTempContent(content)
      setTempContent(seeded)
      onChangeRef.current(process(seeded, mediaList))
    })()

    return () => { cancelled = true }
  }, [content, fetchTopics, fetchMediaByOrganization, getSecure, buildTempContent, process])

  /** Field types not already used by this component, keeping the current one selectable. */
  const getUniqueFields = (componentFields: TempItem['fields'] = [], currentValue: string | null) => {
    const fields = [...FIELD_TYPES]
    for (const field of componentFields ?? []) {
      const index = fields.findIndex(f => f.value === field.key && f.value !== currentValue)
      if (index !== -1) fields.splice(index, 1)
    }
    return fields
  }

  const addComponent = () => commit([...tempContent, { component: '', fields: [] }])

  const deleteComponent = (index: number) =>
    commit(tempContent.filter((_, i) => i !== index))

  const setComponentName = (index: number, name: string) =>
    commit(tempContent.map((it, i) => (i === index ? { ...it, component: name } : it)))

  const addComponentField = (index: number) => {
    const fields = tempContent[index].fields ?? []
    if (fields.length === FIELD_TYPES.length) {
      toast.error('You cannot add more fields', { duration: 5500 })
      return
    }
    commit(tempContent.map((it, i) => (i === index ? { ...it, fields: [...it.fields, { key: null, value: null }] } : it)))
  }

  const deleteComponentField = (index: number, j: number) =>
    commit(tempContent.map((it, i) => (i === index ? { ...it, fields: it.fields.filter((_, k) => k !== j) } : it)))

  const setFieldKey = (index: number, j: number, key: string) =>
    commit(tempContent.map((it, i) =>
      i === index ? { ...it, fields: it.fields.map((f, k) => (k === j ? { ...f, key } : f)) } : it))

  const setFieldValue = (index: number, j: number, value: FieldValue) =>
    commit(tempContent.map((it, i) =>
      i === index ? { ...it, fields: it.fields.map((f, k) => (k === j ? { ...f, value } : f)) } : it))

  const renderFieldValue = (i: number, j: number, field: TempItem['fields'][number]) => {
    const type = getFieldType(field.key)

    switch (type) {
      case 'text':
        return (
          <div>
            <label className={LABEL_CLASS}>Value</label>
            <input className={FIELD_CLASS} value={String(field.value ?? '')} onChange={e => setFieldValue(i, j, e.target.value)} />
          </div>
        )
      case 'number':
        return (
          <div>
            <label className={LABEL_CLASS}>Value</label>
            <input type="number" className={FIELD_CLASS} value={String(field.value ?? '')} onChange={e => setFieldValue(i, j, e.target.value)} />
          </div>
        )
      case 'text-area':
        return (
          <div>
            <label className={LABEL_CLASS}>Value</label>
            <textarea className={`${FIELD_CLASS} min-h-[96px]`} value={String(field.value ?? '')} onChange={e => setFieldValue(i, j, e.target.value)} />
          </div>
        )
      case 'media-select':
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <ImageSelector
                medias={media}
                isMulti
                isUploader
                preSelected={Array.isArray(field.value) ? (field.value as string[]) : []}
                onImageSelected={(uuids: string[]) => setFieldValue(i, j, uuids)}
                refreshMedia={async () => {
                  const r = await fetchMediaByOrganization()
                  setMedia(Array.isArray(r) ? (r as MediaItem[]) : [])
                }}
              />
            </div>
            {/* Nuxt shows the picked media in a disabled select as read-back. */}
            <div className="md:col-span-7">
              <div className={`${FIELD_CLASS} bg-gray-100 text-gray-500 min-h-[42px]`}>
                {(Array.isArray(field.value) ? (field.value as string[]) : [])
                  .map(uuid => media.find(m => m.uuid === uuid)?.name ?? uuid)
                  .join(', ')}
              </div>
            </div>
          </div>
        )
      case 'background-image':
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <ImageSelector
                medias={backgroundMedia}
                preSelected={typeof field.value === 'string' ? field.value : ''}
                onImageSelected={(uuid: string) => setFieldValue(i, j, uuid)}
              />
            </div>
            <div className="md:col-span-7">
              <div className={`${FIELD_CLASS} bg-gray-100 text-gray-500 min-h-[42px]`}>
                {backgroundMedia.find(m => m.uuid === field.value)?.name ?? String(field.value ?? '')}
              </div>
            </div>
          </div>
        )
      case 'switch':
        return (
          <label className="flex items-center gap-3 cursor-pointer select-none mt-6">
            <span className="relative inline-block w-9 h-5 shrink-0">
              <input type="checkbox" className="peer sr-only" checked={!!field.value} onChange={e => setFieldValue(i, j, e.target.checked)} />
              <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-green-600 transition-colors" />
              <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
            </span>
            <span className="text-sm text-gray-800">Is sticky?</span>
          </label>
        )
      case 'topics-select':
        return (
          <MultiSelect
            label="Select topics"
            options={topics.map(t => ({ value: t, label: t }))}
            value={Array.isArray(field.value) ? (field.value as string[]) : []}
            onChange={next => setFieldValue(i, j, next)}
            chips
          />
        )
      case 'service-select':
        // Nuxt keys this by service NAME (item-value="name"), not id.
        return (
          <div>
            <label className={LABEL_CLASS}>Select service</label>
            <select className={FIELD_CLASS} value={String(field.value ?? '')} onChange={e => setFieldValue(i, j, e.target.value)}>
              <option value="">Select service</option>
              {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        )
      case 'background-color':
        return (
          <div>
            <label className={LABEL_CLASS}>Select color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-16 border border-gray-300 rounded"
                value={typeof field.value === 'string' && field.value ? field.value : '#ffffff'}
                onChange={e => setFieldValue(i, j, e.target.value)}
              />
              <input
                className={FIELD_CLASS}
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={e => setFieldValue(i, j, e.target.value)}
              />
            </div>
          </div>
        )
      case 'bullets':
        return (
          <BulletsForm
            initialBullets={[field.value as string]}
            onChange={bullets => setFieldValue(i, j, bullets)}
          />
        )
      case 'custom-bullets':
        return (
          <CustomBulletsForm
            initialBullets={Array.isArray(field.value) ? field.value : []}
            medias={media}
            onChange={bullets => setFieldValue(i, j, bullets)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex items-center mt-5">
        <h2 className="text-xl font-bold">Content</h2>
        <div className="flex-1" />
        <button
          type="button"
          onClick={addComponent}
          aria-label="Add component"
          className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </div>

      {tempContent.map((contentItem, i) => (
        <div key={`${i}-content`} className="mt-5 px-3 py-4 bg-white border border-gray-200 rounded shadow-sm relative">
          <h2 className="text-lg font-bold mb-2">Component</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className={LABEL_CLASS}>Name</label>
              <select
                className={FIELD_CLASS}
                value={contentItem.component}
                onChange={e => setComponentName(i, e.target.value)}
              >
                <option value="">Name</option>
                {componentItems.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="w-full md:w-1/2 flex items-end gap-3">
              {showFields(contentItem.component) && (
                <button
                  type="button"
                  onClick={() => addComponentField(i)}
                  className="bg-[#124e66] text-white px-4 py-2 rounded font-semibold text-sm uppercase mb-2"
                >
                  Add field
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteComponent(i)}
                className="bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm uppercase mb-2"
              >
                Delete component
              </button>
            </div>
          </div>

          {showFields(contentItem.component) && <h2 className="text-lg font-bold mb-2 mt-4">Fields</h2>}

          {contentItem.fields.map((field, j) => (
            <div
              key={`${i}-${j}-content-field`}
              className="flex flex-col md:flex-row gap-3 items-start p-3 mb-3 rounded"
              style={{ boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)' }}
            >
              <div className="w-full md:w-[6%]">
                <h2 className="text-lg font-bold mt-4">{j + 1}</h2>
              </div>
              <div className="w-full md:w-[42%]">
                <label className={LABEL_CLASS}>Type</label>
                <select
                  className={FIELD_CLASS}
                  value={field.key ?? ''}
                  onChange={e => setFieldKey(i, j, e.target.value)}
                >
                  <option value="">Type</option>
                  {getUniqueFields(contentItem.fields, field.key).map(f => (
                    <option key={f.value} value={f.value}>{f.title}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-[42%]">
                {renderFieldValue(i, j, field)}
              </div>
              <div className="w-full md:w-[6%] flex md:justify-center">
                <button
                  type="button"
                  onClick={() => deleteComponentField(i, j)}
                  aria-label={`Delete field ${j + 1}`}
                  className="mt-4 w-8 h-8 rounded-full border border-red-600 text-red-600 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
