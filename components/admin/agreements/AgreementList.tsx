'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Search, Tag, Shapes } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'
import { Pagination } from '@/components/admin/belts/BeltsList'

interface Agreement { id: number; name: string; type: string; content?: string }

/** Admin "Agreements" manager (org-level AGREEMENTS). Edit/add navigate to /admin/agreements/[id|new]. */
export function AgreementList() {
  const router = useRouter()
  const { getSecure, deleteSecure } = useSecureCalls()

  const [items, setItems] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [toDelete, setToDelete] = useState<Agreement | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getSecure<Agreement[]>(SECURE_ENDPOINTS.AGREEMENTS)
        setItems(Array.isArray(res) ? res : [])
      } catch { /* handled */ } finally { setLoading(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () => (search ? items.filter((i) => i.name?.toLowerCase().includes(search.toLowerCase())) : items),
    [items, search]
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => { setPage(1) }, [search, perPage])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.AGREEMENTS, toDelete.id)
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch { /* handled */ } finally { setDeleting(false); setToDelete(null) }
  }

  const edit = (id: number) => router.push(`/admin/agreements/${id}`)

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <div className="bg-[#124e66] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h1 className="text-xl font-medium text-white md:text-2xl">Agreements</h1><p className="text-sm text-white/70">Manage organization agreements</p></div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agreements..." className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none lg:w-72" />
            </div>
            <button onClick={() => router.push('/admin/agreements/new')} className="inline-flex items-center justify-center gap-1 rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66]"><Plus size={18} /> Add Agreement</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">

        {loading ? <p className="py-12 text-center text-gray-500">Loading…</p> : (
          <>
            <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50"><tr>
                  <th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {pageItems.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{a.name}</td>
                      <td className="px-4 py-3 capitalize">{a.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => edit(a.id)} aria-label="Edit" className="text-[#124e66]"><Pencil size={18} /></button>
                          <button onClick={() => setToDelete(a)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-500">No Agreements Found</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {pageItems.map((a) => (
                <MobileCard key={a.id}
                  header={<><Tag size={18} className="text-[#6D6D6D]" /><span className="font-medium">{a.name}</span></>}
                  action={
                    <div className="flex items-center gap-3">
                      <button onClick={() => edit(a.id)} aria-label="Edit" className="text-[#124e66]"><Pencil size={18} /></button>
                      <button onClick={() => setToDelete(a)} aria-label="Delete" className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                  }
                  rows={[{ icon: <Shapes size={18} />, value: <span className="capitalize">{a.type}</span> }]}
                />
              ))}
              {pageItems.length === 0 && <p className="py-10 text-center text-gray-500">No Agreements Found</p>}
            </div>
            <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={filtered.length} />
          </>
        )}
      </div>

      <DeleteWarning popup={!!toDelete} message="Do You Really want to delete this item?" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}
