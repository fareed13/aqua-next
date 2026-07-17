'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Search, Tag, Hash, Briefcase, X } from 'lucide-react'
import { useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'

interface Rank { id: number; name: string; order: number; service: { id: number; name: string } }
interface ServiceOpt { id: number; name: string }

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'
const PER_PAGE_OPTS = [10, 25, 50, 100]

export function BeltsList() {
  const services = useOrgServices() as unknown as ServiceOpt[]
  const { getSecure, postSecure, deleteSecure } = useSecureCalls()

  const [ranks, setRanks] = useState<Rank[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState<number | ''>('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [addOpen, setAddOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Rank | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getSecure<Rank[]>(SECURE_ENDPOINTS.SERVICE_RANK)
        setRanks(Array.isArray(res) ? res : [])
      } catch { /* handled */ } finally { setLoading(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    let r = ranks
    if (serviceFilter) r = r.filter((x) => x.service?.id === serviceFilter)
    if (search) r = r.filter((x) => x.name?.toLowerCase().includes(search.toLowerCase()))
    return r
  }, [ranks, serviceFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => { setPage(1) }, [search, serviceFilter, perPage])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.SERVICE_RANK, toDelete.id)
      setRanks((prev) => prev.filter((x) => x.id !== toDelete.id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch { /* handled */ } finally { setDeleting(false); setToDelete(null) }
  }

  const onCreated = (rank: Rank) => { setRanks((prev) => [rank, ...prev]); setAddOpen(false) }

  return (
    <div className="min-h-full bg-[#f8fafc]">
      {/* Header (search + Add live here, right side — matches Nuxt) */}
      <div className="bg-[#124e66] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-medium text-white md:text-2xl">Belts</h1>
            <p className="text-sm text-white/70">Manage student progression belts</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search belts..." className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none md:w-72" />
            </div>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center gap-1 rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66]">
              <Plus size={18} /> Add Belt
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Filter */}
        <div className="mb-6">
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value ? Number(e.target.value) : '')} className={`${FIELD} sm:w-72`}>
            <option value="">Filter by Service</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading…</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50"><tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{r.order}</td>
                      <td className="px-4 py-3">{r.service?.name}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setToDelete(r)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No Belts Found</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {pageItems.map((r) => (
                <MobileCard
                  key={r.id}
                  header={<><Tag size={18} className="text-[#6D6D6D]" /><span className="font-medium">{r.name}</span></>}
                  action={<button onClick={() => setToDelete(r)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button>}
                  rows={[{ icon: <Hash size={18} />, value: `Order: ${r.order}` }, { icon: <Briefcase size={18} />, value: r.service?.name }]}
                />
              ))}
              {pageItems.length === 0 && <p className="py-10 text-center text-gray-500">No Belts Found</p>}
            </div>

            <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={filtered.length} />
          </>
        )}
      </div>

      {addOpen && <BeltsAddEdit services={services} onClose={() => setAddOpen(false)} onCreated={onCreated} postSecure={postSecure} />}
      <DeleteWarning popup={!!toDelete} message="Are you sure you want to delete this belt?" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}

function BeltsAddEdit({ services, onClose, onCreated, postSecure }: {
  services: ServiceOpt[]
  onClose: () => void
  onCreated: (r: Rank) => void
  postSecure: <T = unknown>(url: string, data: unknown) => Promise<T>
}) {
  const [name, setName] = useState('')
  const [order, setOrder] = useState<number | ''>(1)
  const [service, setService] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim() || order === '' || !service) { toast.error('Please fill out the required fields', { duration: 15000 }); return }
    setSaving(true)
    try {
      const res = await postSecure<Rank>(SECURE_ENDPOINTS.SERVICE_RANK, { name, order, service })
      if (res) onCreated(res)
    } catch { toast.error('Belt could not be added', { duration: 10000 }) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[500px] rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Add Belt</h2>
          <button onClick={onClose} aria-label="Close"><X size={22} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div><label className={LABEL}>Belt Name *</label><input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className={LABEL}>Display Order *</label><input type="number" min={1} className={FIELD} value={order} onChange={(e) => setOrder(e.target.value === '' ? '' : Number(e.target.value))} /><p className="mt-1 text-xs text-gray-500">Lower numbers will appear first</p></div>
          <div><label className={LABEL}>Associated Service *</label>
            <select className={FIELD} value={service} onChange={(e) => setService(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select Service</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 border-t px-6 py-4">
          <button onClick={save} disabled={saving} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Belt'}</button>
          <button onClick={onClose} className="rounded bg-gray-200 px-6 py-2.5 font-medium text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export function Pagination({ page, totalPages, setPage, perPage, setPerPage, total, options = PER_PAGE_OPTS }: {
  page: number; totalPages: number; setPage: (n: number) => void
  perPage: number; setPerPage: (n: number) => void; total: number; options?: number[]
}) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-sm text-gray-600">
      <span>Items per page:</span>
      <select className="rounded border px-2 py-1" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
        {options.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <span>{start}-{end} of {total}</span>
      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded border px-2 py-1 disabled:opacity-40">{'‹'}</button>
      <span>Page {page} of {totalPages}</span>
      <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="rounded border px-2 py-1 disabled:opacity-40">{'›'}</button>
    </div>
  )
}
