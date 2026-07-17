'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Search, User, CalendarClock, Clock, Calendar, X } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useSchedule } from '@/hooks/useSchedule'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'
import { Pagination } from '@/components/admin/belts/BeltsList'

interface Reservation { id: number; class_date: string; contact: { first_name: string; last_name: string }; schedule: { name: string; start_time: string } | null }
interface Contact { id: number; first_name: string; last_name: string }

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function fmtTime12(t?: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h)) return t
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${ampm}`
}
function fmtDateMDY(s: string): string {
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}`
}

export function ReservedClassesList() {
  const { getSecure, postSecure, deleteSecure } = useSecureCalls()

  const [items, setItems] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [addOpen, setAddOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Reservation | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getSecure<Reservation[]>(SECURE_ENDPOINTS.RESERVED_SCHEDULE)
        setItems(Array.isArray(res) ? res : [])
      } catch { /* handled */ } finally { setLoading(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const uniqueDates = useMemo(() => Array.from(new Set(items.map((i) => i.class_date))).filter(Boolean), [items])
  const uniqueClasses = useMemo(() => Array.from(new Set(items.filter((i) => !dateFilter || i.class_date === dateFilter).map((i) => i.schedule?.name).filter(Boolean))) as string[], [items, dateFilter])

  const filtered = useMemo(() => {
    let r = items
    if (dateFilter) r = r.filter((i) => i.class_date === dateFilter)
    if (classFilter) r = r.filter((i) => i.schedule?.name === classFilter)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter((i) => `${i.contact?.first_name} ${i.contact?.last_name}`.toLowerCase().includes(q) || i.schedule?.name?.toLowerCase().includes(q))
    }
    return r
  }, [items, dateFilter, classFilter, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => { setPage(1) }, [search, dateFilter, classFilter, perPage])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.RESERVED_SCHEDULE, toDelete.id)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch { /* handled */ } finally { setDeleting(false); setToDelete(null) }
  }
  const onCreated = (rec: Reservation) => { setItems((prev) => [rec, ...prev]); setAddOpen(false) }

  const name = (r: Reservation) => `${r.contact?.first_name ?? ''} ${r.contact?.last_name ?? ''}`.trim()

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <div className="bg-[#124e66] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h1 className="text-xl font-medium text-white md:text-2xl">Reservations</h1><p className="text-sm text-white/70">Manage class reservations</p></div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reservations..." className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none lg:w-72" />
            </div>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center gap-1 rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66]"><Plus size={18} /> Add Reservation</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Filters row */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setClassFilter('') }} className={`${FIELD} md:w-60`}>
            <option value="">Select Date...</option>
            {uniqueDates.map((d) => <option key={d} value={d}>{fmtDateMDY(d)}</option>)}
          </select>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={`${FIELD} md:w-60`}>
            <option value="">Select Class...</option>
            {uniqueClasses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <p className="py-12 text-center text-gray-500">Loading…</p> : (
          <>
            <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50"><tr>
                  <th className="px-4 py-3 font-semibold">Contact</th><th className="px-4 py-3 font-semibold">Schedule</th>
                  <th className="px-4 py-3 font-semibold">Start Time</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{name(r)}</td>
                      <td className="px-4 py-3">{r.schedule?.name || 'No Schedule'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtTime12(r.schedule?.start_time)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDateMDY(r.class_date)}</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => setToDelete(r)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No Reservations Found</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {pageItems.map((r) => (
                <MobileCard key={r.id}
                  header={<><User size={18} className="text-[#6D6D6D]" /><span className="font-medium">{name(r)}</span></>}
                  action={<button onClick={() => setToDelete(r)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button>}
                  rows={[
                    { icon: <CalendarClock size={18} />, value: r.schedule?.name || 'No Schedule' },
                    { icon: <Clock size={18} />, value: fmtTime12(r.schedule?.start_time) },
                    { icon: <Calendar size={18} />, value: fmtDateMDY(r.class_date) },
                  ]}
                />
              ))}
              {pageItems.length === 0 && <p className="py-10 text-center text-gray-500">No Reservations Found</p>}
            </div>
            <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={filtered.length} />
          </>
        )}
      </div>

      {addOpen && <ReservedClassesAddEdit onClose={() => setAddOpen(false)} onCreated={onCreated} getSecure={getSecure} postSecure={postSecure} />}
      <DeleteWarning popup={!!toDelete} message="Do You Really want to delete this item?" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}

function ReservedClassesAddEdit({ onClose, onCreated, getSecure, postSecure }: {
  onClose: () => void
  onCreated: (rec: Reservation) => void
  getSecure: <T = unknown>(url: string, params?: Record<string, string | number | boolean | undefined>) => Promise<T>
  postSecure: <T = unknown>(url: string, data: unknown) => Promise<T>
}) {
  const { schedule } = useSchedule()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactQuery, setContactQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Contact | null>(null)
  const [dayIdx, setDayIdx] = useState(0) // index into fortnight
  const [selectedClass, setSelectedClass] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  // Next 14 days as { day: weekdayKey, date: 'YYYY-MM-DD', label }
  const fortnight = useMemo(() => {
    const out: { day: string; date: string; label: string }[] = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
      const dayKey = DAY_KEYS[d.getDay()]
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      out.push({ day: dayKey, date, label: `${date} - ${dayKey}` })
    }
    return out
  }, [])

  useEffect(() => {
    getSecure<Contact[]>(SECURE_ENDPOINTS.CUSTOMER_LITE).then((r) => setContacts(Array.isArray(r) ? r : [])).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedDay = fortnight[dayIdx]
  const classes = (schedule as any)?.[selectedDay?.day] ?? []
  const matches = contactQuery ? contacts.filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactQuery.toLowerCase())).slice(0, 8) : []

  const save = async () => {
    if (!selectedCustomer || !selectedClass) { toast.error('Please fill out the required fields', { duration: 15000 }); return }
    setSaving(true)
    try {
      const res = await postSecure<Reservation>(SECURE_ENDPOINTS.RESERVED_SCHEDULE, { class_date: selectedDay.date, contact: selectedCustomer.id, schedule: selectedClass })
      if (res) { toast.success('Reserved Successfully', { duration: 15000 }); onCreated(res) }
    } catch { toast.error('Reserved Class could not be added', { duration: 10000 }) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[500px] rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4"><h2 className="text-lg font-semibold">Add Reservation</h2><button onClick={onClose} aria-label="Close"><X size={22} /></button></div>
        <div className="space-y-4 p-6">
          <div className="relative">
            <label className={LABEL}>Customer *</label>
            <input className={FIELD} value={selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : contactQuery}
              onChange={(e) => { setSelectedCustomer(null); setContactQuery(e.target.value) }} placeholder="Search customer…" />
            {matches.length > 0 && !selectedCustomer && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded border bg-white shadow-lg">
                {matches.map((c) => <button key={c.id} onClick={() => { setSelectedCustomer(c); setContactQuery('') }} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50">{c.first_name} {c.last_name}</button>)}
              </div>
            )}
          </div>
          <div><label className={LABEL}>Day</label>
            <select className={FIELD} value={dayIdx} onChange={(e) => { setDayIdx(Number(e.target.value)); setSelectedClass('') }}>
              {fortnight.map((f, i) => <option key={f.date} value={i}>{f.label}</option>)}
            </select>
          </div>
          <div><label className={LABEL}>Class *</label>
            <select className={FIELD} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 border-t px-6 py-4">
          <button onClick={save} disabled={saving} className="rounded bg-[#d5242c] px-6 py-2.5 font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={onClose} className="rounded bg-gray-200 px-6 py-2.5 font-medium text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}
