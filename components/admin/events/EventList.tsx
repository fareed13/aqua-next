'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Calendar, CalendarDays, CalendarCheck, Search, Plus, Pencil, Trash2,
  Type, Text, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { formatDateUTC } from '@/lib/utils/dateTime'
import type { LocationEvent } from '@/types/api'

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20]
const DATE_PATTERN = 'YYYY-MM-DD hh:mm:ss A'

/**
 * Events admin list — ports Nuxt components/events/admin/EventList.vue.
 *
 * Nuxt renders a v-data-table on desktop and a v-data-iterator of cards on
 * mobile, both fed by one page/search state; the same split is kept here.
 */
export function EventList() {
  const router = useRouter()
  const { getSecure, deleteSecure } = useSecureCalls()

  const [events, setEvents] = useState<LocationEvent[]>([])
  const [overlay, setOverlay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<LocationEvent | null>(null)
  const [deletePopup, setDeletePopup] = useState(false)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const loadEvents = useCallback(async (): Promise<LocationEvent[]> => {
    try {
      const data = await getSecure<LocationEvent[]>(SECURE_ENDPOINTS.EVENTS)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }, [getSecure])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setOverlay(true)
      const data = await loadEvents()
      if (cancelled) return
      setEvents(data)
      setOverlay(false)
    })()
    return () => { cancelled = true }
  }, [loadEvents])

  // Nuxt searches name + description only (not the dates).
  const filteredItems = useMemo(() => {
    const term = search ? search.toLowerCase() : ''
    return events.filter(item =>
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)),
    )
  }, [events, search])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const pagedItems = useMemo(
    () => filteredItems.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredItems, page, itemsPerPage],
  )

  const paginationRange = (() => {
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, filteredItems.length)
    return `${start}-${end} of ${filteredItems.length}`
  })()

  const toggleDeletePopup = (item: LocationEvent | null) => {
    setSelectedEvent(item)
    setDeletePopup(!!item)
  }

  const delEvent = async () => {
    if (!selectedEvent) return
    const id = selectedEvent.id
    try {
      setLoading(true)
      await deleteSecure(SECURE_ENDPOINTS.EVENTS, id)
      setEvents(prev => prev.filter(ad => ad.id !== id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch {
      /* Nuxt closes the popup either way */
    } finally {
      setLoading(false)
      toggleDeletePopup(null)
    }
  }

  const fmt = (d: string | null | undefined) => (d && formatDateUTC(d, DATE_PATTERN)) || '-'

  return (
    <div>
      <DeleteWarning
        popup={deletePopup}
        onConfirm={delEvent}
        onCancel={() => toggleDeletePopup(null)}
        loading={loading}
        message="Do You Really want to delete this item?"
      />

      {/* Header */}
      <div className="p-4" style={{ backgroundColor: '#124e66' }}>
        <div className="mx-auto flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center">
            <Calendar className="mr-3 text-white" size={32} />
            <div>
              <h1 className="text-xl text-white mb-1">Events</h1>
              <p className="text-sm text-white/70 mb-0">Manage events</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:items-center">
            <div className="relative w-full min-w-[300px]">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/60" />
              <input
                className="w-full bg-white border border-gray-300 rounded pl-10 pr-3 py-2 text-sm"
                placeholder="Search events..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/events/new')}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 px-4 py-2 rounded font-semibold text-sm uppercase whitespace-nowrap"
            >
              <Plus size={18} /> Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#f5f5f5]">
        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-lg shadow p-4">
          {overlay && (
            <div className="h-1 bg-blue-100 overflow-hidden rounded mb-2">
              <div className="h-full w-1/3 bg-blue-600 animate-pulse" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-sm font-semibold">Description</th>
                  <th className="px-4 py-3 text-sm font-semibold">Start Date</th>
                  <th className="px-4 py-3 text-sm font-semibold">End Date</th>
                  <th className="px-4 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No data available</td>
                  </tr>
                ) : pagedItems.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">{fmt(item.start_datetime)}</td>
                    <td className="px-4 py-3">{fmt(item.end_datetime)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/events/${item.id}`)}
                          aria-label={`Edit event ${item.name || item.id}`}
                          className="p-1 text-gray-700"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleDeletePopup(item)}
                          aria-label={`Delete event ${item.name || item.id}`}
                          className="p-1 text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Footer
            show={events.length > 0}
            page={page} totalPages={totalPages} itemsPerPage={itemsPerPage}
            paginationRange={paginationRange}
            onPageChange={setPage}
            onItemsPerPageChange={v => { setPage(1); setItemsPerPage(v) }}
          />
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden">
          {pagedItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pagedItems.map(item => (
                <div key={item.id} className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex flex-col">
                    <div className="text-sm mb-2 flex items-center" title={item.name}>
                      <Type size={18} className="mr-1 text-gray-500 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="text-sm mb-2 flex items-center" title={item.description}>
                      <Text size={18} className="mr-1 text-gray-500 shrink-0" />
                      <span className="truncate">{item.description}</span>
                    </div>
                    <div className="text-sm mb-2 flex items-center" title={fmt(item.start_datetime)}>
                      <CalendarDays size={18} className="mr-1 text-gray-500 shrink-0" />
                      <span className="truncate">{fmt(item.start_datetime)}</span>
                    </div>
                    <div className="text-sm flex items-center" title={fmt(item.end_datetime)}>
                      <CalendarCheck size={18} className="mr-1 text-gray-500 shrink-0" />
                      <span className="truncate">{fmt(item.end_datetime)}</span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/events/${item.id}`)}
                      aria-label={`Edit event ${item.name || item.id}`}
                      className="mr-2 shrink-0 p-1 text-teal-600"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDeletePopup(item)}
                      aria-label={`Delete event ${item.name || item.id}`}
                      className="shrink-0 p-1 text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar size={48} className="mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold">No Events Found</h3>
              <p className="text-sm mb-4">Start by adding your first event.</p>
              <button
                type="button"
                onClick={() => router.push('/admin/events/new')}
                className="flex items-center gap-1 text-white px-4 py-2 rounded font-semibold text-sm uppercase"
                style={{ backgroundColor: '#124e66' }}
              >
                <Plus size={18} /> Add First Event
              </button>
            </div>
          )}
          <Footer
            show={events.length > 0}
            page={page} totalPages={totalPages} itemsPerPage={itemsPerPage}
            paginationRange={paginationRange}
            onPageChange={setPage}
            onItemsPerPageChange={v => { setPage(1); setItemsPerPage(v) }}
          />
        </div>
      </div>
    </div>
  )
}

/** Nuxt's data-iterator footer: items-per-page + first/prev/next/last. */
function Footer({
  show, page, totalPages, itemsPerPage, paginationRange, onPageChange, onItemsPerPageChange,
}: {
  show: boolean
  page: number
  totalPages: number
  itemsPerPage: number
  paginationRange: string
  onPageChange: (p: number) => void
  onItemsPerPageChange: (v: number) => void
}) {
  if (!show) return null
  const btn = 'p-1 rounded disabled:opacity-40'
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between p-4 gap-3">
      <div className="flex flex-col md:flex-row items-center">
        <span className="mr-2">Items per page:</span>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm w-[85px]"
          value={itemsPerPage}
          onChange={e => onItemsPerPageChange(Number(e.target.value))}
        >
          {ITEMS_PER_PAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="flex flex-col md:flex-row items-center">
        <span className="mr-4">{paginationRange}</span>
        <div className="flex gap-1">
          <button type="button" className={btn} disabled={page === 1} onClick={() => onPageChange(1)} aria-label="First page">
            <ChevronsLeft size={18} />
          </button>
          <button type="button" className={btn} disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))} aria-label="Previous page">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className={btn} disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))} aria-label="Next page">
            <ChevronRight size={18} />
          </button>
          <button type="button" className={btn} disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} aria-label="Last page">
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
