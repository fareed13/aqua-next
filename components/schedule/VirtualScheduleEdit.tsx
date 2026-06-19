'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const CLASS_TYPES = [
  { label: 'Virtual', value: 'virtual' },
  { label: 'In Person', value: 'in-person' },
  { label: 'Both', value: 'both' },
]

function to24(time12: string): string {
  if (!time12) return ''
  const [time, modifier] = time12.split(' ')
  let [hours, minutes] = time.split(':')
  if (hours === '12') hours = '00'
  if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12)
  return `${hours.padStart(2, '0')}:${minutes}`
}

function to12(time24: string): string {
  if (!time24) return ''
  const [h, m] = time24.split(':')
  const hour = parseInt(h, 10)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${suffix}`
}

interface Schedule {
  id?: number
  name?: string
  start_time?: string
  end_time?: string
  service?: number
  eligible_for_trial_class?: boolean
  day_of_week?: string
  class_type?: string
  link?: string
  capacity?: number | null
  booking_active_from?: string | null
  booking_active_to?: string | null
  booking_close_dates?: string[]
}

interface VirtualScheduleEditProps {
  popup: boolean
  toggleEditPopup: () => void
  schedule?: Schedule | null
  selectedLocationId: number
}

export function VirtualScheduleEdit({ popup, toggleEditPopup, schedule, selectedLocationId }: VirtualScheduleEditProps) {
  const services = useOrgStore(s => s.services)
  const { postSecure, putSecure } = useSecureCalls()

  const isEdit = !!schedule?.id
  const [form, setForm] = useState({
    name: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    service_id: '' as number | '',
    class_type: 'virtual',
    link: '',
    capacity: '' as number | '',
    eligible_for_trial_class: false,
    booking_active_from: '',
    booking_active_to: '',
    booking_close_dates: [] as string[],
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (popup && schedule) {
      setForm({
        name: schedule.name ?? '',
        day_of_week: schedule.day_of_week ?? '',
        start_time: schedule.start_time ? to12(schedule.start_time) : '',
        end_time: schedule.end_time ? to12(schedule.end_time) : '',
        service_id: schedule.service ?? '',
        class_type: schedule.class_type ?? 'virtual',
        link: schedule.link ?? '',
        capacity: schedule.capacity ?? '',
        eligible_for_trial_class: schedule.eligible_for_trial_class ?? false,
        booking_active_from: schedule.booking_active_from ?? '',
        booking_active_to: schedule.booking_active_to ?? '',
        booking_close_dates: schedule.booking_close_dates ?? [],
      })
    } else if (popup) {
      setForm({
        name: '', day_of_week: '', start_time: '', end_time: '',
        service_id: '', class_type: 'virtual', link: '', capacity: '',
        eligible_for_trial_class: false, booking_active_from: '', booking_active_to: '',
        booking_close_dates: [],
      })
    }
  }, [popup, schedule])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name) errs.name = 'Required'
    if (!form.day_of_week) errs.day_of_week = 'Required'
    if (!form.start_time) errs.start_time = 'Required'
    if (!form.service_id) errs.service_id = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildPayload = () => ({
    name: form.name,
    start_time: form.start_time ? to24(form.start_time) : '',
    end_time: form.end_time ? to24(form.end_time) : '',
    service_id: form.service_id,
    eligible_for_trial_class: form.eligible_for_trial_class,
    day_of_week: form.day_of_week,
    class_type: form.class_type,
    link: form.link,
    capacity: !form.capacity || Number(form.capacity) < 0 ? 0 : form.capacity,
    pretty_start_time: form.start_time,
    pretty_end_time: form.end_time,
    location_id: selectedLocationId,
    booking_active_from: form.booking_active_from || null,
    booking_active_to: form.booking_active_to || null,
    booking_close_dates: form.booking_close_dates,
  })

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      if (isEdit) {
        await putSecure(SECURE_ENDPOINTS.SCHEDULE, { id: schedule!.id, ...buildPayload() })
      } else {
        await postSecure(SECURE_ENDPOINTS.SCHEDULE, buildPayload())
      }
      toggleEditPopup()
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const toggleCloseDate = (date: string) => {
    setForm(prev => ({
      ...prev,
      booking_close_dates: prev.booking_close_dates.includes(date)
        ? prev.booking_close_dates.filter(d => d !== date)
        : [...prev.booking_close_dates, date],
    }))
  }

  if (!popup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">{isEdit ? 'Edit' : 'Add'} Schedule</h2>
          <button onClick={toggleEditPopup} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Trial toggle */}
          <div className="border rounded p-3 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.eligible_for_trial_class}
                onChange={e => set('eligible_for_trial_class', e.target.checked)} />
              <span className="text-sm font-medium">Can trial students attend this class?</span>
            </label>

            {form.eligible_for_trial_class && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Trial Activation Start</label>
                  <input type="date" className="w-full border rounded px-2 py-1 text-sm"
                    value={form.booking_active_from} onChange={e => set('booking_active_from', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Trial Activation End</label>
                  <input type="date" className="w-full border rounded px-2 py-1 text-sm"
                    value={form.booking_active_to} min={form.booking_active_from || undefined}
                    onChange={e => set('booking_active_to', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Trial Closing Date(s)</label>
                  <input type="date" className="w-full border rounded px-2 py-1 text-sm"
                    onChange={e => { if (e.target.value) toggleCloseDate(e.target.value); e.target.value = '' }} />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.booking_close_dates.map(d => (
                      <span key={d} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {d}
                        <button onClick={() => toggleCloseDate(d)} className="hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : ''}`}
              value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Day of week */}
          <div>
            <label className="block text-sm font-medium mb-1">Day of Week <span className="text-red-500">*</span></label>
            <select className={`w-full border rounded px-3 py-2 ${errors.day_of_week ? 'border-red-500' : ''}`}
              value={form.day_of_week} onChange={e => set('day_of_week', e.target.value)}>
              <option value="">Select day</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.day_of_week && <p className="text-red-500 text-xs mt-1">{errors.day_of_week}</p>}
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time <span className="text-red-500">*</span></label>
              <input type="time" className={`w-full border rounded px-3 py-2 ${errors.start_time ? 'border-red-500' : ''}`}
                value={form.start_time ? to24(form.start_time) : ''}
                onChange={e => set('start_time', e.target.value ? to12(e.target.value) : '')} />
              {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input type="time" className="w-full border rounded px-3 py-2"
                value={form.end_time ? to24(form.end_time) : ''}
                onChange={e => set('end_time', e.target.value ? to12(e.target.value) : '')} />
            </div>
          </div>

          {/* Service */}
          <div>
            <label className="block text-sm font-medium mb-1">Service <span className="text-red-500">*</span></label>
            <select className={`w-full border rounded px-3 py-2 ${errors.service_id ? 'border-red-500' : ''}`}
              value={form.service_id} onChange={e => set('service_id', Number(e.target.value) || '')}>
              <option value="">Select service</option>
              {(services ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.service_id && <p className="text-red-500 text-xs mt-1">{errors.service_id}</p>}
          </div>

          {/* Class type */}
          <div>
            <label className="block text-sm font-medium mb-1">Class Type</label>
            <select className="w-full border rounded px-3 py-2"
              value={form.class_type} onChange={e => set('class_type', e.target.value)}>
              {CLASS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium mb-1">Link</label>
            <input type="text" className="w-full border rounded px-3 py-2"
              value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://..." />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input type="number" min={0} className="w-full border rounded px-3 py-2"
              value={form.capacity} onChange={e => set('capacity', Number(e.target.value) || '')} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-blue-700 text-white px-5 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button onClick={toggleEditPopup}
            className="bg-red-600 text-white px-5 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
