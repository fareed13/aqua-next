'use client'

import { useState, useEffect, useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { getPublicAuthHeader } from '@/lib/utils/initializeSocket'
import { toast } from 'sonner'
import { parseApiError } from '@/lib/utils/parseApiError'

interface Props {
  customerId: number
  changeStep: (step: number) => void
  selectedLocation: { id: number; schedules_count?: number }
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function InlineCalendar({
  value,
  onChange,
  allowedDates,
}: {
  value: string
  onChange: (date: string) => void
  allowedDates: string[]
}) {
  const todayStr = new Date().toLocaleDateString('en-CA')

  const initial = value ? new Date(value + 'T00:00:00') : new Date()
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const allowedSet = useMemo(() => new Set(allowedDates), [allowedDates])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="w-full max-w-xs mx-auto select-none">
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-lg font-bold"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-700">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600 text-lg font-bold"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const mm = String(viewMonth + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          const dateStr = `${viewYear}-${mm}-${dd}`
          const isAllowed = allowedSet.has(dateStr)
          const isSelected = dateStr === value
          const isToday = dateStr === todayStr
          return (
            <div key={i} className="flex justify-center">
              <button
                type="button"
                disabled={!isAllowed}
                onClick={() => onChange(dateStr)}
                className={[
                  'w-8 h-8 rounded-full text-xs transition-colors',
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : isAllowed
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-200 font-semibold border border-blue-200'
                    : isToday
                    ? 'text-gray-400 border border-dashed border-gray-300'
                    : 'text-gray-300 cursor-not-allowed',
                ].join(' ')}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AppointmentBooking({ customerId, changeStep, selectedLocation }: Props) {
  const organization = useOrgStore((s) => s.organization)
  const orgId = organization?.id
  const checkoutAuthToken = useUiStore((s) => s.checkoutAuthToken)
  const selectedScheduleFromStore = useUiStore((s) => s.selectedSchedule)
  const selectedScheduleDateFromStore = useUiStore((s) => s.selectedScheduleDate)
  const { getPublic, postPublicProtected } = useNonSecureCalls()

  const [progressLoading, setProgressLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [availabilitySlotsData, setAvailabilitySlotsData] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [picker, setPicker] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)
  const [confirmationPopup, setConfirmationPopup] = useState(false)
  const [bookedSlotDate, setBookedSlotDate] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const filteredSlots = useMemo(() => {
    if (selectedService === null) return availabilitySlotsData
    return availabilitySlotsData.filter((slot: any) => {
      const svcId = slot.service?.id ?? slot.service_id
      return svcId === selectedService
    })
  }, [availabilitySlotsData, selectedService])

  const allowedDateStrings = useMemo<string[]>(() => {
    return filteredSlots.map((slot: any) => slot.date)
  }, [filteredSlots])

  const slotsForDate = useMemo(() => {
    if (!picker) return filteredSlots
    return filteredSlots.filter((slot: any) => slot.date === picker)
  }, [filteredSlots, picker])

  // Auto-advance picker to the first available date when the service filter changes
  useEffect(() => {
    if (allowedDateStrings.length > 0 && !allowedDateStrings.includes(picker)) {
      setPicker(allowedDateStrings[0])
    }
  }, [allowedDateStrings, picker])

  useEffect(() => {
    if ((selectedLocation.schedules_count ?? 0) < 1) {
      changeStep(4)
      return
    }
    const today = new Date().toLocaleDateString('en-CA')
    setPicker(today)

    // Matches Nuxt AppointmentBooking.vue onMounted: if a schedule was pre-set by
    // bookClass (Book Now from schedule page), pre-load it and open confirmation popup
    if (selectedScheduleFromStore) {
      const preloaded = selectedScheduleFromStore as any
      setAvailabilitySlotsData([preloaded])
      if (selectedScheduleDateFromStore) setPicker(selectedScheduleDateFromStore)
      toggleConfirmationPopup(preloaded)
    }

    getAvailabilitySlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getAvailabilitySlots() {
    setProgressLoading(true)
    try {
      const today = new Date()
      const start_date = today.toLocaleDateString('en-CA')
      const futureDate = new Date(today)
      futureDate.setDate(futureDate.getDate() + 13)
      const end_date = futureDate.toLocaleDateString('en-CA')

      const result = await getPublic<any[]>(NON_SECURE_ENDPOINTS.SCHEDULE_SLOTS, {
        start_date,
        end_date,
        location_id: selectedLocation.id,
      })

      const slots: any[] = Array.isArray(result) ? result : []
      setAvailabilitySlotsData(slots)
      filterServices(slots)

      if (slots.length === 0) {
        changeStep(4)
      }
    } catch {
      setAvailabilitySlotsData([])
    } finally {
      setProgressLoading(false)
    }
  }

  function filterServices(slots: any[]) {
    const seen = new Set<number>()
    const unique: any[] = []
    for (const slot of slots) {
      const svcId = slot.service?.id ?? slot.service_id
      const svcName = slot.service?.name ?? slot.service_name ?? slot.name
      if (svcId != null && !seen.has(svcId)) {
        seen.add(svcId)
        unique.push({ id: svcId, name: svcName })
      }
    }
    setServices(unique)
    if (unique.length > 0) setSelectedService(unique[0].id)
  }

  function toggleConfirmationPopup(slot: any) {
    const mm = slot.date
      ? new Date(slot.date + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
      : slot.date
    setMessage(`You will be booked for ${slot.name} at ${slot.pretty_start_time} on ${mm}.`)
    setSelectedSlot(slot)
    setBookedSlotDate(slot.date)
    setConfirmationPopup(true)
  }

  function cancelPopup() {
    setConfirmationPopup(false)
  }

  async function bookAppointment() {
    if (!selectedSlot) return
    setLoading(true)
    try {
      const authHeader = organization?.recaptcha_enabled
        ? (sessionStorage.getItem('recaptcha_token') ?? '')
        : (checkoutAuthToken || await getPublicAuthHeader(orgId!, false))

      await postPublicProtected(
        NON_SECURE_ENDPOINTS.BOOKING_APPOINTMENT,
        {
          schedule_id: selectedSlot.id,
          booked_time: selectedSlot.start_time,
          booked_date: bookedSlotDate,
          customer_id: customerId,
        },
        authHeader
      )
      toast.success('Appointment booked successfully')
      changeStep(4)
    } catch (err) {
      toast.error(parseApiError(err))
    } finally {
      setLoading(false)
      setConfirmationPopup(false)
    }
  }

  function formatCardDate(date: string): string {
    if (!date) return ''
    const d = new Date(date + 'T00:00:00')
    if (isNaN(d.getTime())) return date
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-full py-6">
      {/* Confirmation popup */}
      {confirmationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <p className="text-gray-800 text-base font-medium">{message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={cancelPopup}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={bookAppointment}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline calendar — shown once slots are loaded */}
      {availabilitySlotsData.length > 0 && (
        <div className="flex justify-center mb-5 mt-2 px-4">
          <InlineCalendar
            value={picker}
            onChange={setPicker}
            allowedDates={allowedDateStrings}
          />
        </div>
      )}

      {/* Program dropdown — below calendar, matching Nuxt layout */}
      {availabilitySlotsData.length > 0 && services.length > 0 && (
        <div className="px-6 mb-4">
          <select
            value={selectedService ?? ''}
            onChange={(e) => setSelectedService(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {services.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Slot cards — scrollable, below dropdown */}
      <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: '440px' }}>
        {progressLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-10 h-10" />
          </div>
        ) : slotsForDate.length > 0 ? (
          <div className="space-y-3">
            {slotsForDate.map((slot: any, index: number) => (
              <div
                key={slot.id ?? index}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleConfirmationPopup(slot)}
              >
                <p className="text-gray-900 font-semibold text-base">{slot.name}</p>
                <p className="text-gray-500 text-xs mt-1 mb-1">{formatCardDate(slot.date)}</p>
                <p className="text-gray-600 text-xs">
                  {slot.pretty_start_time}
                  {slot.pretty_end_time ? ` – ${slot.pretty_end_time}` : ''}
                </p>
                <button
                  type="button"
                  className="mt-3 w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold uppercase tracking-wide hover:bg-blue-700 transition-colors"
                >
                  BOOK NOW
                </button>
              </div>
            ))}
          </div>
        ) : (
          !progressLoading && (
            <p className="text-center text-gray-500 text-sm py-8">Slots are not available</p>
          )
        )}
      </div>
    </div>
  )
}
