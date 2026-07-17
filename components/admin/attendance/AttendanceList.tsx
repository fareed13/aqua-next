'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Search, User, CalendarClock, Clock, X } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useSchedule } from '@/hooks/useSchedule'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'
import { Pagination } from '@/components/admin/belts/BeltsList'

interface Attendance { id: number; contact: { first_name: string; last_name: string }; schedule: { name: string } | null; created_at: string; full_name?: string }
interface Contact { id: number; first_name: string; last_name: string }

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function fmtDateTime(s: string): string {
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function AttendanceList() {
  const { getSecure, postSecure, deleteSecure } = useSecureCalls()

  const [items, setItems] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [addOpen, setAddOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Attendance | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getSecure<Attendance[]>(SECURE_ENDPOINTS.ATTENDANCE)
        const list = (Array.isArray(res) ? res : []).map((el) => ({ ...el, full_name: `${el.contact?.first_name ?? ''} ${el.contact?.last_name ?? ''}`.trim() }))
        setItems(list)
      } catch { /* handled */ } finally { setLoading(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((i) => i.full_name?.toLowerCase().includes(q) || i.schedule?.name?.toLowerCase().includes(q))
  }, [items, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => { setPage(1) }, [search, perPage])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.ATTENDANCE, toDelete.id)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch { /* handled */ } finally { setDeleting(false); setToDelete(null) }
  }

  const onCreated = (rec: Attendance) => {
    setItems((prev) => [{ ...rec, full_name: `${rec.contact?.first_name ?? ''} ${rec.contact?.last_name ?? ''}`.trim() }, ...prev])
    setAddOpen(false)
  }

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <div className="bg-[#124e66] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h1 className="text-xl font-medium text-white md:text-2xl">Attendance</h1><p className="text-sm text-white/70">Manage student attendance records</p></div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search attendance..." className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none lg:w-72" />
            </div>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center gap-1 rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66]"><Plus size={18} /> Add Attendance</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">

        {loading ? <p className="py-12 text-center text-gray-500">Loading…</p> : (
          <>
            <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50"><tr>
                  <th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Schedule</th>
                  <th className="px-4 py-3 font-semibold">CheckIn Time</th><th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {pageItems.map((i) => (
                    <tr key={i.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{i.full_name}</td>
                      <td className="px-4 py-3">{i.schedule?.name || 'No Schedule'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(i.created_at)}</td>
                      <td className="px-4 py-3 text-right"><button onClick={() => setToDelete(i)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No Attendance Records Found</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {pageItems.map((i) => (
                <MobileCard key={i.id}
                  header={<><User size={18} className="text-[#6D6D6D]" /><span className="font-medium">{i.full_name}</span></>}
                  action={<button onClick={() => setToDelete(i)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button>}
                  rows={[{ icon: <CalendarClock size={18} />, value: i.schedule?.name || 'No Schedule' }, { icon: <Clock size={18} />, value: fmtDateTime(i.created_at) }]}
                />
              ))}
              {pageItems.length === 0 && <p className="py-10 text-center text-gray-500">No Attendance Records Found</p>}
            </div>
            <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={filtered.length} />
          </>
        )}
      </div>

      {addOpen && <AttendanceAddEdit onClose={() => setAddOpen(false)} onCreated={onCreated} getSecure={getSecure} postSecure={postSecure} />}
      <DeleteWarning popup={!!toDelete} message="Do You Really want to delete this item?" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}

function AttendanceAddEdit({ onClose, onCreated, getSecure, postSecure }: {
  onClose: () => void
  onCreated: (rec: Attendance) => void
  getSecure: <T = unknown>(url: string, params?: Record<string, string | number | boolean | undefined>) => Promise<T>
  postSecure: <T = unknown>(url: string, data: unknown) => Promise<T>
}) {
  const { schedule } = useSchedule()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactQuery, setContactQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Contact | null>(null)
  const [day, setDay] = useState('monday')
  const [selectedClass, setSelectedClass] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSecure<Contact[]>(SECURE_ENDPOINTS.CUSTOMER_LITE).then((r) => setContacts(Array.isArray(r) ? r : [])).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const classes = (schedule as any)?.[day] ?? []
  const matches = contactQuery
    ? contacts.filter((c) => `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactQuery.toLowerCase())).slice(0, 8)
    : []

  const save = async () => {
    if (!selectedCustomer || !selectedClass) { toast.error('Please fill out the required fields', { duration: 15000 }); return }
    setSaving(true)
    try {
      const res = await postSecure<Attendance>(SECURE_ENDPOINTS.ATTENDANCE, { contact: selectedCustomer.id, schedule: selectedClass })
      if (res) { toast.success('Attendance added Successfully', { duration: 15000 }); onCreated(res) }
    } catch { toast.error('Reserved Class could not be added', { duration: 10000 }) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[500px] rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4"><h2 className="text-lg font-semibold">Add Attendance</h2><button onClick={onClose} aria-label="Close"><X size={22} /></button></div>
        <div className="space-y-4 p-6">
          <div className="relative">
            <label className={LABEL}>Customer Name *</label>
            <input className={FIELD} value={selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : contactQuery}
              onChange={(e) => { setSelectedCustomer(null); setContactQuery(e.target.value) }} placeholder="Search customer…" />
            {matches.length > 0 && !selectedCustomer && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded border bg-white shadow-lg">
                {matches.map((c) => (
                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setContactQuery('') }} className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50">{c.first_name} {c.last_name}</button>
                ))}
              </div>
            )}
          </div>
          <div><label className={LABEL}>Day</label>
            <select className={FIELD} value={day} onChange={(e) => { setDay(e.target.value); setSelectedClass('') }}>
              {DAYS.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
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
          <button onClick={save} disabled={saving} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          <button onClick={onClose} className="rounded bg-gray-200 px-6 py-2.5 font-medium text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}
