'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { ContentBuilder } from '@/components/admin/ContentBuilder'
import { FIELD_CLASS, LABEL_CLASS } from '@/components/form/Combobox'
import { formatDate } from '@/lib/utils/dateTime'
import {
  isRequired, whitespaceCheck, negativeValueCheck, maxLimit,
  greaterThanZero, AllowPositiveIntegers, validateField,
} from '@/hooks/useValidation'
import type { LocationEvent, ComponentContent } from '@/types/api'

interface Props {
  /** Undefined for /admin/events/new — mirrors Nuxt's `slug !== 'new' ? slug : undefined`. */
  eventId?: string
}

/**
 * Normalises whatever the datetime input produced into the backend's
 * 'YYYY-MM-DD HH:mm:ss'. Ports Nuxt's parseDateTimeStr, including its reason for
 * stripping the timezone suffix: `new Date('...Z')` would re-interpret the value
 * as UTC and shift it by the local offset, so the wall-clock time the admin
 * picked must be parsed as local.
 */
function parseDateTimeStr(str: string | null | undefined): string | null {
  if (!str) return null
  const trimmed = str.trim()
  if (trimmed.includes('T')) {
    const d = new Date(trimmed.replace(/Z$|[+-]\d{2}:?\d{2}$/, ''))
    return isNaN(d.getTime()) ? null : formatDate(d, 'YYYY-MM-DD HH:mm:ss') || null
  }
  const parts = trimmed.split(' ')
  const datePart = parts[0]
  const timePart = parts[1]
  if (!timePart) return null
  const period = parts[2]?.toUpperCase()
  const [hRaw, m] = timePart.split(':').map(Number)
  let h = hRaw
  if (isNaN(h) || isNaN(m)) return null
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  const d = new Date(`${datePart}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
  return isNaN(d.getTime()) ? null : formatDate(d, 'YYYY-MM-DD HH:mm:ss') || null
}

/** The <input type="datetime-local"> value format. */
function toLocalInputValue(v: string | null | undefined): string {
  if (!v) return ''
  const parsed = parseDateTimeStr(v)
  return parsed ? parsed.replace(' ', 'T').slice(0, 16) : ''
}

/**
 * Add/Edit Event form — ports Nuxt components/events/admin/EventAddEdit.vue.
 */
export function EventAddEdit({ eventId }: Props) {
  const router = useRouter()
  const location = useOrgStore(s => s.location)
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const editMode = !!eventId

  const [overlay, setOverlay] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDatetime, setStartDatetime] = useState('')
  const [endDatetime, setEndDatetime] = useState('')
  const [price, setPrice] = useState('')
  const [memberPrice, setMemberPrice] = useState('')
  const [capacity, setCapacity] = useState('')
  const [enrolled, setEnrolled] = useState('')
  // `content` seeds the builder; `processedContent` is what the builder emits
  // back and what actually gets saved (Nuxt: :content / v-model).
  const [content, setContent] = useState<ComponentContent[]>([])
  const [processedContent, setProcessedContent] = useState<Array<Record<string, unknown>>>([])
  const onContentChange = useCallback(
    (processed: Array<Record<string, unknown>>) => setProcessedContent(processed),
    [],
  )

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [startTimeError, setStartTimeError] = useState(false)
  const [endTimeError, setEndTimeError] = useState(false)

  useEffect(() => {
    if (!eventId) return
    let cancelled = false

    ;(async () => {
      setOverlay(true)
      try {
        const response = await getSecure<LocationEvent[]>(SECURE_ENDPOINTS.EVENTS, { id: parseInt(eventId) })
        const event = response?.[0]
        if (cancelled) return
        if (!event) { router.push('/admin/events'); return }

        setId(event.id)
        setName(event.name ?? '')
        setContent(event.content ? (event.content as ComponentContent[]) : [])
        setStartDatetime(toLocalInputValue(event.start_datetime))
        setEndDatetime(toLocalInputValue(event.end_datetime))
        setDescription(event.description ?? '')
        setCapacity(event.capacity != null ? String(event.capacity) : '')
        setEnrolled(event.enrolled != null ? String(event.enrolled) : '')
        setPrice(event.price != null ? String(event.price) : '')
        setMemberPrice(event.member_price != null ? String(event.member_price) : '')
      } catch {
        if (!cancelled) router.push('/admin/events')
      } finally {
        if (!cancelled) setOverlay(false)
      }
    })()

    return () => { cancelled = true }
  }, [eventId, getSecure, router])

  /** Nuxt's local rule — member price may not exceed price. */
  const priceCheck = (value: unknown) => {
    if (price && parseFloat(String(value)) > parseFloat(price)) {
      return 'Member price is greater than Price'
    }
    return true as const
  }

  const validateDateRange = (): boolean => {
    if (!startDatetime || !endDatetime) return true
    const s = parseDateTimeStr(startDatetime)
    const e = parseDateTimeStr(endDatetime)
    if (!s || !e) return true
    const start = new Date(s)
    const end = new Date(e)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return true
    return end > start
  }

  /** Nuxt validates exactly these five fields. */
  const validateFields = (): boolean => {
    const next: Record<string, string | null> = {
      name: validateField(name, [isRequired, whitespaceCheck]),
      description: validateField(description, [isRequired, whitespaceCheck]),
      price: validateField(price, [isRequired, whitespaceCheck, negativeValueCheck, maxLimit]),
      member_price: validateField(memberPrice, [negativeValueCheck, priceCheck, whitespaceCheck]),
      capacity: validateField(capacity, [isRequired, whitespaceCheck, greaterThanZero, AllowPositiveIntegers]),
    }
    setErrors(next)
    return Object.values(next).every(e => e === null)
  }

  const submit = async () => {
    const validated = validateFields()
    const parsedStart = parseDateTimeStr(startDatetime)
    const parsedEnd = parseDateTimeStr(endDatetime)

    if (!validated || !parsedStart || !parsedEnd) {
      setStartTimeError(!parsedStart)
      setEndTimeError(!parsedEnd)
      toast.error('Please fill out required fields', { duration: 5000 })
      return
    }
    setStartTimeError(false)

    if (!validateDateRange()) {
      setEndTimeError(true)
      toast.error('End date/time must be after start date/time', { duration: 5000 })
      return
    }
    setEndTimeError(false)

    const now = formatDate(new Date(), 'YYYY-MM-DD hh:mm:ss')
    const common = {
      name,
      location: location?.id,
      content: processedContent,
      start_datetime: parsedStart,
      end_datetime: parsedEnd,
      description,
      price: parseFloat(price),
      capacity,
      member_price: parseFloat(memberPrice),
      updated_at: now,
    }

    setOverlay(true)
    try {
      if (editMode) {
        await putSecure(SECURE_ENDPOINTS.EVENTS, { id, ...common })
        toast.success('Event Updated successfully', { duration: 15000 })
      } else {
        await postSecure(SECURE_ENDPOINTS.EVENTS, { ...common, created_at: now })
        toast.success('Event created successfully', { duration: 15000 })
      }
    } catch {
      /* Nuxt navigates away regardless */
    } finally {
      setOverlay(false)
      router.push('/admin/events')
    }
  }

  const err = (k: string) => errors[k] ? <p className="text-xs text-red-600 mt-1">{errors[k]}</p> : null
  const dateField = (invalid: boolean) =>
    `${FIELD_CLASS} ${invalid ? 'border-red-600' : ''}`

  return (
    <div className="px-5 py-5 md:px-10 md:mx-10 md:py-10">
      {overlay && (
        <div className="fixed inset-0 z-[99] bg-white/70 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <h1 className="text-3xl font-bold text-black mb-6">{editMode ? 'Edit Event' : 'Add Event'}</h1>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-5">
          <div className="w-full md:w-[45%]">
            <label className={LABEL_CLASS}>Select start datetime</label>
            <input
              type="datetime-local"
              className={dateField(startTimeError)}
              value={startDatetime}
              onChange={e => { setStartDatetime(e.target.value); setStartTimeError(false) }}
            />
            <p className="text-xs text-gray-500 mt-1">Start datetime</p>
          </div>
          <div className="w-full md:w-[45%]">
            <label className={LABEL_CLASS}>Select end datetime</label>
            <input
              type="datetime-local"
              className={dateField(endTimeError)}
              value={endDatetime}
              onChange={e => { setEndDatetime(e.target.value); setEndTimeError(false) }}
            />
            <p className="text-xs text-gray-500 mt-1">End datetime</p>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Name</label>
          <input className={FIELD_CLASS} value={name} onChange={e => setName(e.target.value)} />
          {err('name')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Description</label>
          <input className={FIELD_CLASS} value={description} onChange={e => setDescription(e.target.value)} />
          {err('description')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Price</label>
          <input className={FIELD_CLASS} value={price} onChange={e => setPrice(e.target.value)} />
          {err('price')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Member Price</label>
          <input className={FIELD_CLASS} value={memberPrice} onChange={e => setMemberPrice(e.target.value)} />
          {err('member_price')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Capacity</label>
          <input className={FIELD_CLASS} value={capacity} onChange={e => setCapacity(e.target.value)} />
          {err('capacity')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Enrolled</label>
          <input className={`${FIELD_CLASS} bg-gray-100 text-gray-500`} value={enrolled} disabled readOnly />
        </div>

        <ContentBuilder content={content} onChange={onContentChange} />

        <div className="pt-2">
          <button
            type="button"
            onClick={submit}
            aria-label={editMode ? 'Update event' : 'Save event'}
            className="bg-gray-900 text-white px-6 py-2 rounded font-semibold text-sm uppercase mr-4"
          >
            {editMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
