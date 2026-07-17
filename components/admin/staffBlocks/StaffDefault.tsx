'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { buildMediaUrl } from '@/lib/utils/media'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { StaffAddEdit } from './StaffAddEdit'

interface StaffRow { id: number; name: string; slug: string; media?: any }

/** Ports Nuxt staffBlocks/StaffDefault.vue — instructor grid with admin add/edit/delete. */
export function StaffDefault() {
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore((s) => s.organization)
  const { deleteSecure } = useSecureCalls()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isAdmin = mounted && isAdminLoggedIn()

  const [staffs, setStaffs] = useState<StaffRow[]>([])
  useEffect(() => {
    setStaffs(((organization as any)?.staffs ?? []) as StaffRow[])
  }, [organization])

  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<StaffRow | null>(null)
  const [deletePopup, setDeletePopup] = useState(false)
  const [toDelete, setToDelete] = useState<StaffRow | null>(null)
  const [loading, setLoading] = useState(false)

  const heading = useMemo(() => {
    const industry = (organization as any)?.industry_type ?? ''
    const many = staffs.length > 1
    if (industry === 'salon') return many ? 'Our Stylists' : 'Our Stylist'
    if (industry === 'accounting') return 'Our Team'
    return many ? 'Our Instructors' : 'Our Instructor'
  }, [organization, staffs.length])

  const openAdd = () => { setSelected(null); setEditOpen(true) }
  const openEdit = (s: StaffRow) => { setSelected(s); setEditOpen(true) }

  const confirmDelete = async () => {
    if (!toDelete) return
    setLoading(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.STAFF, toDelete.id)
      setStaffs((prev) => prev.filter((x) => x.id !== toDelete.id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch { /* handled */ } finally {
      setLoading(false)
      setDeletePopup(false)
      setToDelete(null)
    }
  }

  return (
    <div className="relative z-[5] bg-white pb-[120px]">
      <div className="mx-auto max-w-6xl px-4">
        {isAdmin && (
          <div className="mt-6 text-center">
            <button onClick={openAdd} className="mx-2 inline-flex items-center gap-1 rounded bg-[#124E66] px-4 py-2.5 font-medium text-white">
              <PlusCircle size={18} /> Add Instructor (admin)
            </button>
          </div>
        )}

        <h2 className="my-10 block text-center text-4xl font-bold uppercase">{heading}</h2>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-3">
          {staffs.map((instructor, idx) => {
            const imgUrl = instructor.media ? buildMediaUrl(instructor.media, 700) : ''
            return (
              <div key={instructor.id ?? idx} className="my-8">
                {isAdmin && (
                  <div className="mb-3 flex justify-center gap-2">
                    <button onClick={() => openEdit(instructor)} aria-label="Edit" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0c3cac] text-[#0c3cac]">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => { setToDelete(instructor); setDeletePopup(true) }} aria-label="Delete" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d90000] text-[#d90000]">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <Link href={`/instructors/${instructor.slug}`} className="text-white no-underline">
                  <div className="group relative mx-4 border-[8px] border-[#c7c7c7]">
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={imgUrl || '/placeholder.jpg'}
                        alt={instructor.name || 'Staff photo'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-3 py-3 transition-all duration-500 group-hover:bg-[rgba(213,36,44,0.8)]">
                        <p className="m-0 break-words text-center text-2xl font-bold uppercase text-white">
                          {instructor.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {isAdmin && (
        <>
          <StaffAddEdit open={editOpen} staff={selected} onClose={() => setEditOpen(false)} />
          <DeleteWarning
            popup={deletePopup}
            message="Do You Really want to delete this item?"
            loading={loading}
            onConfirm={confirmDelete}
            onCancel={() => { setDeletePopup(false); setToDelete(null) }}
          />
        </>
      )}
    </div>
  )
}
