'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Tag, ListChecks, Type } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'
import { Pagination } from '@/components/admin/belts/BeltsList'
import { AdLibraryAddEdit } from '@/components/admin/adLibrary/AdLibraryAddEdit'

interface AdMedia {
  uuid?: string
  extension?: string
  type?: string
  media_type?: string
}

interface Ad {
  id: number
  name?: string
  ad_type?: number
  contents?: string[]
  titles?: string[]
  primary_texts?: string[]
  tags?: string[]
  service_type?: string
  media?: AdMedia | null
}

const AD_TYPES: Record<number, string> = { 1: 'Facebook', 2: 'Google' }

function mediaSrc(m?: AdMedia | null, size = 350): string {
  if (!m?.uuid) return ''
  const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
  const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? MEDIA_URL
  const isVideo = m.extension === 'mp4' || m.type === 'video' || m.media_type === 'video'
  const base = isVideo ? VIDEO_URL : MEDIA_URL
  return `${base}/${m.uuid}_${size}.${m.extension}`
}

function isVideoMedia(m?: AdMedia | null): boolean {
  return !!m && (m.extension === 'mp4' || m.type === 'video' || m.media_type === 'video')
}

const DASH = '- - - - -'

function Chips({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <span className="text-gray-400">{DASH}</span>
  return (
    <div className="flex max-w-[300px] flex-wrap gap-1">
      {items.map((c, i) => (
        <span key={i} title={c} className="inline-flex max-w-full items-center rounded bg-[#fb0062] px-2 py-0.5 text-xs text-white">
          <span className="truncate">{c}</span>
        </span>
      ))}
    </div>
  )
}

function MediaThumb({ media, name, size = 350, className }: { media?: AdMedia | null; name?: string; size?: number; className?: string }) {
  if (!media?.uuid) return <span className="text-gray-400">{DASH}</span>
  if (isVideoMedia(media)) {
    return <video src={`${mediaSrc(media, size)}#t=2`} className={className ?? 'h-[60px] w-[70px] object-cover'} aria-label={name || 'Ad media video'} />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={mediaSrc(media, size)} alt={name || 'Ad media image'} className={className ?? 'h-[60px] w-[100px] object-contain'} />
}

export function AdLibraryList() {
  const { getSecure, deleteSecure } = useSecureCalls()

  const [view, setView] = useState<{ mode: 'list' } | { mode: 'edit'; adId?: string }>({ mode: 'list' })
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [toDelete, setToDelete] = useState<Ad | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAds = async () => {
    setLoading(true)
    try {
      const res = await getSecure<Ad[]>(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE)
      setAds(Array.isArray(res) ? res : [])
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!search) return ads
    const q = search.toLowerCase()
    return ads.filter(
      (item) =>
        (item.ad_type != null && AD_TYPES[item.ad_type]?.toLowerCase().includes(q)) ||
        item.contents?.some((c) => c.toLowerCase().includes(q)) ||
        item.titles?.some((t) => t.toLowerCase().includes(q)),
    )
  }, [ads, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => {
    setPage(1)
  }, [search, perPage])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE, toDelete.id)
      setAds((prev) => prev.filter((a) => a.id !== toDelete.id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch {
      /* handled */
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  if (view.mode === 'edit') {
    return (
      <AdLibraryAddEdit
        adId={view.adId}
        onClose={() => setView({ mode: 'list' })}
        onSaved={() => {
          setView({ mode: 'list' })
          fetchAds()
        }}
      />
    )
  }

  const HEADERS = ['Media', 'Ad Type', 'Name', 'Titles', 'Contents', 'Primary Texts', 'Tags', 'Service Type', 'Actions']

  return (
    <div className="min-h-full bg-[#f5f5f5]">
      {/* Teal header */}
      <div className="bg-[#124e66] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Tag size={32} className="text-white" />
            <div>
              <h1 className="text-xl font-medium text-white md:text-2xl">Ad Library</h1>
              <p className="text-sm text-white/70">Manage ad content</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ads..."
                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none lg:w-80"
              />
            </div>
            <button
              onClick={() => setView({ mode: 'edit', adId: undefined })}
              className="inline-flex items-center justify-center gap-1 rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66]"
            >
              <Plus size={18} /> Add Ad
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading…</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    {HEADERS.map((h) => (
                      <th key={h} className={`px-4 py-3 font-semibold ${h === 'Actions' ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id} className="border-b align-top hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <MediaThumb media={item.media} name={item.name} />
                      </td>
                      <td className="px-4 py-3">{item.ad_type != null ? AD_TYPES[item.ad_type] ?? DASH : DASH}</td>
                      <td className="px-4 py-3">{item.name || DASH}</td>
                      <td className="px-4 py-3"><Chips items={item.titles} /></td>
                      <td className="px-4 py-3"><Chips items={item.contents} /></td>
                      <td className="px-4 py-3"><Chips items={item.primary_texts} /></td>
                      <td className="px-4 py-3"><Chips items={item.tags} /></td>
                      <td className="px-4 py-3">{item.service_type || DASH}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setView({ mode: 'edit', adId: String(item.id) })} aria-label={`Edit ${item.name || 'ad'}`} className="text-[#124e66]">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => setToDelete(item)} aria-label={`Delete ${item.name || 'ad'}`} className="text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-gray-500">
                        No ad libraries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {pageItems.map((item) => {
                const rows: { icon?: ReactNode; value: ReactNode }[] = [
                  { icon: <Tag size={18} />, value: item.ad_type != null ? AD_TYPES[item.ad_type] ?? DASH : DASH },
                ]
                if (item.contents?.length) rows.push({ icon: <ListChecks size={18} />, value: <div><span className="mb-1 block">Contents:</span><Chips items={item.contents} /></div> })
                if (item.titles?.length) rows.push({ icon: <Type size={18} />, value: <div><span className="mb-1 block">Titles:</span><Chips items={item.titles} /></div> })
                return (
                  <MobileCard
                    key={item.id}
                    header={
                      <div className="min-w-0">
                        {item.media?.uuid && <MediaThumb media={item.media} name={item.name} className="mb-2 h-[120px] w-full object-cover" />}
                        <span className="font-medium">{item.name || DASH}</span>
                      </div>
                    }
                    action={
                      <div className="flex items-center gap-2">
                        <button onClick={() => setView({ mode: 'edit', adId: String(item.id) })} aria-label={`Edit ${item.name || 'ad'}`} className="text-[#124e66]">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setToDelete(item)} aria-label={`Delete ${item.name || 'ad'}`} className="text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    }
                    rows={rows}
                  />
                )
              })}
              {pageItems.length === 0 && <p className="py-10 text-center text-gray-500">No ad libraries found</p>}
            </div>

            <Pagination page={page} totalPages={totalPages} setPage={setPage} perPage={perPage} setPerPage={setPerPage} total={filtered.length} options={[5, 10, 15, 20]} />
          </>
        )}
      </div>

      <DeleteWarning popup={!!toDelete} message="Are you sure you want to delete this ad?" loading={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  )
}
