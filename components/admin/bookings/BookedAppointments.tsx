'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, X, Users, Hash, Pencil, Heart, MoreVertical } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

type ViewType = 'month' | 'week' | 'day'

interface CalEvent {
  name: string
  date: string
  count: number
  customers: string
  schedule: number
  backgroundColor: string
}

interface SelectedEvent {
  name: string
  count: number
  customers: string
  ui: string
}

const PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin]

function fcView(v: ViewType): string {
  return v === 'week' ? 'timeGridWeek' : v === 'day' ? 'timeGridDay' : 'dayGridMonth'
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function BookedAppointments() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure } = useSecureCalls()
  const locations = useOrgStore((s) => s.locations)
  const organization = useOrgStore((s) => s.organization)
  const color = (organization?.colors?.['app-main-accent-with-transparent'] as string) || '#124e66'

  const desktopRef = useRef<FullCalendar>(null)
  const mobileRef = useRef<FullCalendar>(null)

  // Client-only render of FullCalendar (avoids SSR of the calendar).
  const [mounted, setMounted] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [type, setType] = useState<ViewType>('month')
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null)
  const [selectedOpen, setSelectedOpen] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const [label, setLabel] = useState(monthLabel(new Date()))
  // prev only allowed after going forward; next capped at +1 month (Nuxt counters).
  const [counterPrev, setCounterPrev] = useState(0)
  const [counterNext, setCounterNext] = useState(0)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    setMounted(true)
    if (locations && locations.length > 0) setSelectedLocation(locations[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const locationTitle = (l: any) => (l.target_locations && l.target_locations[0]) || l.city

  const fetchBookings = useCallback(async (locationId: number) => {
    setOverlay(true)
    try {
      // org id is auto-injected by secureClient; only location_id is passed (Nuxt).
      const data = await getSecure<any[]>(SECURE_ENDPOINTS.BOOKED_APPOINTMENTS, { location_id: locationId })
      const list = Array.isArray(data) ? data : []
      setBookings(list)
      if (!list.length) toast.info('Booked appointments are not found', { duration: 5000 })
    } catch {
      setBookings([])
    } finally {
      setOverlay(false)
    }
  }, [getSecure])

  useEffect(() => {
    if (selectedLocation != null) fetchBookings(selectedLocation)
  }, [selectedLocation, fetchBookings])

  // Aggregate bookings into calendar events (Nuxt updateRanges): same schedule+date+name
  // increments count and concatenates customer names.
  const events = useMemo<CalEvent[]>(() => {
    const acc: CalEvent[] = []
    bookings.forEach(({ schedule, booked_date, booked_time, customer }: any) => {
      if (!schedule || !booked_date) return
      const name = `${schedule.name} ${booked_time} to ${schedule.pretty_end_time}`
      const existing = acc.find((e) => e.schedule === schedule.id && e.date === booked_date && e.name === name)
      const custName = `${customer?.first_name ?? ''} ${customer?.last_name ?? ''}`.trim()
      if (existing) {
        existing.count += 1
        existing.customers += `, ${custName}`
      } else {
        acc.push({ name, date: booked_date, count: 1, customers: custName, schedule: schedule.id, backgroundColor: color })
      }
    })
    return acc
  }, [bookings, color])

  // Shape for FullCalendar (custom fields land in extendedProps).
  const fcEvents = useMemo(
    () => events.map((e) => ({
      start: e.date,
      allDay: true,
      backgroundColor: e.backgroundColor,
      borderColor: e.backgroundColor,
      extendedProps: { name: e.name, count: e.count, customers: e.customers, schedule: e.schedule },
    })),
    [events]
  )

  const eachApi = () => [desktopRef.current?.getApi(), mobileRef.current?.getApi()].filter(Boolean) as any[]

  const prev = () => {
    if (counterPrev <= 0) return
    setCounterPrev((c) => c - 1)
    setCounterNext((c) => c - 1)
    eachApi().forEach((a) => a.prev())
  }
  const next = () => {
    if (counterNext >= 1) return
    setCounterNext((c) => c + 1)
    setCounterPrev((c) => c + 1)
    eachApi().forEach((a) => a.next())
  }
  const changeView = (v: ViewType) => {
    setType(v)
    eachApi().forEach((a) => a.changeView(fcView(v)))
  }

  const onEventClick = (ev: any) => {
    setSelectedEvent({
      name: ev.extendedProps.name,
      count: ev.extendedProps.count,
      customers: ev.extendedProps.customers,
      ui: ev.backgroundColor,
    })
    setSelectedOpen(true)
  }

  // Custom event render (matches Nuxt eventContent: colored chip w/ name + count badge).
  const renderEvent = (arg: any) => (
    <div
      onClick={() => onEventClick(arg.event)}
      className="flex cursor-pointer items-center justify-between gap-1 truncate rounded px-1 py-0.5 text-[11px] text-white"
      style={{ backgroundColor: arg.event.backgroundColor }}
    >
      <span className="truncate">{arg.event.extendedProps.name}</span>
      {arg.event.extendedProps.count > 1 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[8px] font-bold">
          {arg.event.extendedProps.count}
        </span>
      )}
    </div>
  )

  const viewBtn = (v: ViewType, text: string) => (
    <button
      onClick={() => changeView(v)}
      className={`min-w-[80px] rounded-full border px-3 py-2 text-sm font-semibold transition ${
        type === v ? 'border-[#175383] bg-[#175383] text-white shadow' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {text}
    </button>
  )

  const onDatesSet = (arg: any) => setLabel(monthLabel(arg.view.currentStart))

  return (
    <div className="booked-appointments">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      {/* ===================== MOBILE ===================== */}
      <div className="md:hidden">
        <div className="mb-4 bg-gradient-to-br from-[#175383] to-[#124e66] p-4">
          <h3 className="flex items-center gap-2 text-xl font-medium text-white">Booked Appointments</h3>
        </div>

        <div className="px-4 pb-4">
          {locations && locations.length > 0 && (
            <select
              value={selectedLocation ?? ''}
              onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base"
            >
              {locations.map((l) => <option key={l.id} value={l.id}>{locationTitle(l)}</option>)}
            </select>
          )}
        </div>

        <div className="mx-4 mb-4 flex items-center justify-between rounded-lg bg-white p-3 shadow">
          <button onClick={prev} disabled={counterPrev <= 0} aria-label="Previous month" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <span className="text-base font-semibold text-gray-800">{label}</span>
          <button onClick={next} disabled={counterNext >= 1} aria-label="Next month" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mx-4 mb-4 flex justify-around rounded-lg bg-white p-3 shadow">
          {viewBtn('month', 'Month')}
          {viewBtn('week', 'Week')}
          {viewBtn('day', 'Day')}
        </div>

        <div className="mx-4 overflow-hidden rounded-xl bg-white shadow" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {mounted && (
            <FullCalendar
              ref={mobileRef}
              plugins={PLUGINS}
              initialView="dayGridMonth"
              headerToolbar={false}
              height="auto"
              aspectRatio={1.2}
              dayMaxEventRows={3}
              navLinks
              events={fcEvents}
              eventContent={renderEvent}
              datesSet={onDatesSet}
            />
          )}
        </div>
      </div>

      {/* ===================== DESKTOP ===================== */}
      <div className="hidden md:block">
        <div className="mx-5 mb-16 mt-10 px-10">
          <div className="mb-4 w-full max-w-xs">
            {locations && locations.length > 0 && (
              <select
                value={selectedLocation ?? ''}
                onChange={(e) => setSelectedLocation(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-base"
              >
                {locations.map((l) => <option key={l.id} value={l.id}>{locationTitle(l)}</option>)}
              </select>
            )}
          </div>

          <div className="mb-2 flex gap-1">
            <button onClick={prev} disabled={counterPrev <= 0} title="Previous month" className="flex h-10 w-12 items-center justify-center bg-[#124e66] text-white disabled:opacity-50">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} disabled={counterNext >= 1} title="Next month" className="flex h-10 w-12 items-center justify-center bg-[#124e66] text-white disabled:opacity-50">
              <ChevronRight size={18} />
            </button>
          </div>

          {mounted && (
            <FullCalendar
              ref={desktopRef}
              plugins={PLUGINS}
              initialView="dayGridMonth"
              headerToolbar={{ right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
              dayMaxEventRows={2}
              navLinks
              events={fcEvents}
              eventContent={renderEvent}
              datesSet={onDatesSet}
            />
          )}

          {/* Desktop detail side card */}
          {selectedOpen && selectedEvent && (
            <div className="mt-4 w-full max-w-md rounded bg-gray-50 shadow">
              <div className="flex items-center gap-2 px-3 py-2 text-white" style={{ backgroundColor: selectedEvent.ui }}>
                <Pencil size={18} className="opacity-80" />
                <span className="flex-1 text-center font-medium" dangerouslySetInnerHTML={{ __html: selectedEvent.name }} />
                <Heart size={18} className="opacity-80" />
                <MoreVertical size={18} className="opacity-80" />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex gap-2">
                  <h3 className="font-semibold">{selectedEvent.count > 1 ? 'Customers' : 'Customer'}:</h3>
                  <p dangerouslySetInnerHTML={{ __html: selectedEvent.customers }} />
                </div>
                <h3 className="font-semibold">Total Count: <span className="font-normal">{selectedEvent.count}</span></h3>
              </div>
              <div className="px-4 pb-3">
                <button onClick={() => setSelectedOpen(false)} className="text-sm font-medium text-gray-600">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile fullscreen event modal */}
      {selectedOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ backgroundColor: selectedEvent.ui }}>
            <button onClick={() => setSelectedOpen(false)} aria-label="Close event details"><X size={22} /></button>
            <span className="flex-1 text-center font-medium">{selectedEvent.name}</span>
            <span className="w-6" />
          </div>
          <div className="flex-1 space-y-6 p-5">
            <div className="flex items-start gap-2">
              <Users size={20} className="mt-0.5 text-[#124e66]" />
              <div>
                <h4 className="text-sm font-semibold text-gray-600">{selectedEvent.count > 1 ? 'Customers' : 'Customer'}:</h4>
                <p className="text-base text-gray-800">{selectedEvent.customers}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash size={20} className="mt-0.5 text-[#124e66]" />
              <div>
                <h4 className="text-sm font-semibold text-gray-600">Total Count:</h4>
                <p className="text-base text-gray-800">{selectedEvent.count}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 p-4">
            <button onClick={() => setSelectedOpen(false)} className="w-full rounded bg-[#124e66] py-2.5 font-medium text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
