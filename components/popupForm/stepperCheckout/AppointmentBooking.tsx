'use client'

import { useState, useEffect, useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Props {
  customerId: number
  changeStep: (step: number) => void
  selectedLocation: { id: number; schedules_count?: number }
}

export function AppointmentBooking({ customerId, changeStep, selectedLocation }: Props) {
  const orgId = useOrgStore((s) => s.organization?.id)
  const { getPublic, postPublic } = useNonSecureCalls()

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
    return availabilitySlotsData.filter((slot: any) => slot.service_id === selectedService)
  }, [availabilitySlotsData, selectedService])

  const allowedDates = useMemo<Date[]>(() => {
    return filteredSlots.map((slot: any) => new Date(slot.date))
  }, [filteredSlots])

  useEffect(() => {
    if ((selectedLocation.schedules_count ?? 0) < 1) {
      changeStep(4)
      return
    }
    const today = new Date().toLocaleDateString('en-CA')
    setPicker(today)
    getAvailabilitySlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function getAvailabilitySlots() {
    setProgressLoading(true)
    try {
      const today = new Date()
      const start_date = today.toLocaleDateString('en-CA')
      const futureDate = new Date(today)
      futureDate.setMonth(futureDate.getMonth() + 3)
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
      if (!seen.has(slot.service_id)) {
        seen.add(slot.service_id)
        unique.push({ id: slot.service_id, name: slot.service_name ?? slot.name })
      }
    }
    setServices(unique)
    if (unique.length > 0) {
      setSelectedService(unique[0].id)
    }
  }

  function toggleConfirmationPopup(slot: any) {
    setSelectedSlot(slot)
    setMessage(`Book "${slot.name}" on ${slot.date} from ${slot.pretty_start_time} to ${slot.pretty_end_time}?`)
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
      await postPublic(NON_SECURE_ENDPOINTS.BOOKING_APPOINTMENT, {
        customer_id: customerId,
        slot_id: selectedSlot.id,
        date: bookedSlotDate,
        location_id: selectedLocation.id,
      })
    } catch {
      // proceed to next step regardless
    } finally {
      setLoading(false)
      setConfirmationPopup(false)
      changeStep(4)
    }
  }

  function formatCardDate(date: string): string {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return date
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const slotsForDate = filteredSlots.filter((slot: any) => slot.date === picker)

  return (
    <div className="w-full px-4 py-6 space-y-6">
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

      {/* Date picker */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Select Date</label>
        <input
          type="date"
          value={picker}
          onChange={(e) => setPicker(e.target.value)}
          className="border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {picker && (
          <p className="text-xs text-gray-500 pt-1">{formatCardDate(picker)}</p>
        )}
      </div>

      {/* Service selector */}
      {availabilitySlotsData.length > 0 && services.length > 0 && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Select Service</label>
          <select
            value={selectedService ?? ''}
            onChange={(e) => setSelectedService(Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {services.map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading spinner */}
      {progressLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-10 h-10" />
        </div>
      )}

      {/* Slot list */}
      {!progressLoading && (
        <div className="space-y-3">
          {slotsForDate.length > 0 ? (
            slotsForDate.map((slot: any, index: number) => (
              <div
                key={slot.id ?? index}
                className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className="space-y-0.5">
                  <p className="text-gray-900 font-semibold text-sm">{slot.name}</p>
                  <p className="text-gray-500 text-xs">{formatCardDate(slot.date)}</p>
                  <p className="text-gray-600 text-xs">
                    {slot.pretty_start_time}
                    {slot.pretty_end_time ? ` – ${slot.pretty_end_time}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => toggleConfirmationPopup(slot)}
                  className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold uppercase tracking-wide hover:bg-blue-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            ))
          ) : (
            !loading && (
              <p className="text-center text-gray-500 text-sm py-8">Slots are not available</p>
            )
          )}
        </div>
      )}
    </div>
  )
}
