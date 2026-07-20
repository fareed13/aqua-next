'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  User,
  Briefcase,
  Cake,
  MapPin,
  Users,
  GraduationCap,
  Star,
  VenetianMask,
} from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'
import { Pagination } from '@/components/admin/belts/BeltsList'
import { TargetMarketAddEdit } from './TargetMarketAddEdit'
import type { Audience, Interest, FamilyStatusOption } from './TargetMarketAddEdit'

// The API returns interests (and sometimes the other chip fields) as EITHER an array OR an
// object map keyed by id. Vue's v-for/.length tolerated objects, but React's .map() throws.
// Normalize every chip field to an array once, at load time, so all downstream renders are safe.
function toArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[]
  if (v && typeof v === 'object') return Object.values(v as Record<string, T>)
  return []
}
function normalizeAudience(a: Audience): Audience {
  return {
    ...a,
    interests: toArray<Interest>(a.interests),
    genders: toArray<string>(a.genders),
    education_statuses: toArray<string>(a.education_statuses),
    family_statuses: toArray<number>(a.family_statuses),
  }
}

// Nuxt's `educationStatuses` label list — indexed directly by `parseInt(status)`
// (kept faithful to the list component, off-by-one vs the Add/Edit value map and all).
const EDUCATION_LABELS = [
  'High School',
  'Undergraduate',
  'Alumni',
  'High School Graduate',
  'Some College',
  'Associate Degree',
  'In Graduation School',
  'Some Graduation School',
  'Master Degree',
  'Professional Degree',
  'Doctorate Degree',
  'Unspecified',
  'Some High School',
]

const CHIP = 'inline-flex max-w-[160px] items-center truncate rounded-full bg-[#fb0062] px-2 py-0.5 text-[11px] text-white'
const PER_PAGE_OPTS = [5, 10, 15, 20]

export function TargetMarketList() {
  const { getSecure, deleteSecure } = useSecureCalls()

  const [audiences, setAudiences] = useState<Audience[]>([])
  const [familyStatusOptions, setFamilyStatusOptions] = useState<FamilyStatusOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [toDelete, setToDelete] = useState<Audience | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Inline add/edit toggle (Nuxt routed to /admin/target-market/:id; embedded in the
  // settings accordion we swap the view in place instead).
  const [view, setView] = useState<{ mode: 'add' } | { mode: 'edit'; id: number } | null>(null)

  const loadAudiences = async () => {
    try {
      setLoading(true)
      const [fsRes, audRes] = await Promise.all([
        getSecure<FamilyStatusOption[]>(SECURE_ENDPOINTS.FAMILY_STATUS),
        getSecure<Audience[]>(SECURE_ENDPOINTS.AUDIENCE),
      ])
      setFamilyStatusOptions(Array.isArray(fsRes) ? fsRes : [])
      setAudiences(Array.isArray(audRes) ? audRes.map(normalizeAudience) : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAudiences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const familyName = (id: number) =>
    familyStatusOptions.find((f) => f.id === id)?.name ?? String(id)
  const genderName = (g: string) => (g === '1' ? 'Male' : 'Female')
  const educationName = (es: string) => EDUCATION_LABELS[parseInt(es, 10)] ?? es

  const filtered = useMemo(() => {
    if (!search) return audiences
    const q = search.toLowerCase()
    return audiences.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.service?.name?.toLowerCase().includes(q) ||
        a.min_age?.toString().includes(q) ||
        a.max_age?.toString().includes(q) ||
        a.miles_radius?.toString().includes(q),
    )
  }, [audiences, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => {
    setPage(1)
  }, [search, perPage])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.AUDIENCE, toDelete.id)
      setAudiences((prev) => prev.filter((a) => a.id !== toDelete.id))
      toast.success('Deleted successfully', { duration: 15000 })
    } catch {
      /* handled by interceptor */
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const showAllChips = (label: string, values: string[]) => {
    toast.info(`${label}: ${values.join(', ')}`, { duration: 5000 })
  }

  // Return from inline add/edit → refresh list.
  const onSaved = () => {
    setView(null)
    void loadAudiences()
  }

  if (view) {
    return (
      <TargetMarketAddEdit
        audienceId={view.mode === 'edit' ? view.id : undefined}
        fromBuilder
        onSaved={onSaved}
        onCancel={() => setView(null)}
      />
    )
  }

  // Chip fields shared by desktop + mobile.
  const chipFields = (a: Audience) => [
    {
      icon: <Users size={18} />,
      label: 'Family Statuses',
      values: (a.family_statuses ?? []).map((fs) => familyName(fs)),
    },
    {
      icon: <GraduationCap size={18} />,
      label: 'Education Statuses',
      values: (a.education_statuses ?? []).map((es) => educationName(es)),
    },
    {
      icon: <Star size={18} />,
      label: 'Targeting Interests',
      values: (a.interests ?? []).map((i: Interest) => i.name),
    },
    {
      icon: <VenetianMask size={18} />,
      label: 'Genders',
      values: (a.genders ?? []).map((g) => genderName(g)),
    },
  ]

  return (
    <div className="min-h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[#124e66] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <User size={30} className="text-white" />
            <div>
              <h1 className="text-xl font-medium text-white">Target Market</h1>
              <p className="text-sm text-white/70">Manage target audiences</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative">
              <Search
                size={20}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audiences..."
                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none lg:w-80"
              />
            </div>
            <button
              onClick={() => setView({ mode: 'add' })}
              className="inline-flex items-center justify-center gap-1 rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66]"
            >
              <Plus size={18} /> Add Market
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-5">
        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading…</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Min Age</th>
                    <th className="px-4 py-3 font-semibold">Max Age</th>
                    <th className="px-4 py-3 font-semibold">Miles Radius</th>
                    <th className="px-4 py-3 font-semibold">Family Statuses</th>
                    <th className="px-4 py-3 font-semibold">Education Statuses</th>
                    <th className="px-4 py-3 font-semibold">Targeting Interests</th>
                    <th className="px-4 py-3 font-semibold">Genders</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((a) => (
                    <tr key={a.id} className="border-b align-top hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">{a.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{a.service?.name ?? '---'}</td>
                      <td className="px-4 py-3">{a.min_age}</td>
                      <td className="px-4 py-3">{a.max_age}</td>
                      <td className="px-4 py-3">{a.miles_radius}</td>
                      <td className="px-4 py-3">
                        <ChipCell values={(a.family_statuses ?? []).map((fs) => familyName(fs))} />
                      </td>
                      <td className="px-4 py-3">
                        <ChipCell
                          values={(a.education_statuses ?? []).map((es) => educationName(es))}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <ChipCell values={(a.interests ?? []).map((i) => i.name)} />
                      </td>
                      <td className="px-4 py-3">
                        <ChipCell values={(a.genders ?? []).map((g) => genderName(g))} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setView({ mode: 'edit', id: a.id })}
                            aria-label="Edit"
                            className="text-gray-600 hover:text-[#124e66]"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => setToDelete(a)}
                            aria-label="Delete"
                            className="text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                        No target markets found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {pageItems.map((a) => (
                <MobileCard
                  key={a.id}
                  header={
                    <>
                      <User size={18} className="text-[#6D6D6D]" />
                      <span className="font-semibold">{a.name}</span>
                    </>
                  }
                  action={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setView({ mode: 'edit', id: a.id })}
                        aria-label="Edit"
                        className="text-gray-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setToDelete(a)}
                        aria-label="Delete"
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  }
                  rows={[
                    { icon: <Briefcase size={18} />, value: a.service?.name ?? '---' },
                    { icon: <Cake size={18} />, value: `${a.min_age ?? ''} - ${a.max_age ?? ''}` },
                    { icon: <MapPin size={18} />, value: a.miles_radius ?? '---' },
                    ...chipFields(a).map((f) => ({
                      icon: f.icon,
                      value:
                        f.values.length === 0 ? (
                          '---'
                        ) : (
                          <span className="flex flex-wrap items-center gap-1">
                            {f.values.slice(0, 2).map((v, i) => (
                              <span key={i} className={CHIP}>
                                {v}
                              </span>
                            ))}
                            {f.values.length > 2 && (
                              <button
                                type="button"
                                onClick={() => showAllChips(f.label, f.values)}
                                className="rounded-full border border-[#fb0062] bg-[#fb0062]/10 px-2 py-0.5 text-[11px] text-[#fb0062]"
                              >
                                +{f.values.length - 2}
                              </button>
                            )}
                          </span>
                        ),
                    })),
                  ]}
                />
              ))}
              {pageItems.length === 0 && (
                <p className="py-10 text-center text-gray-500">No target markets found</p>
              )}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              perPage={perPage}
              setPerPage={setPerPage}
              total={filtered.length}
              options={PER_PAGE_OPTS}
            />
          </>
        )}
      </div>

      <DeleteWarning
        popup={!!toDelete}
        message="Do You Really want to delete this target market?"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

/** Desktop table cell: renders every value as a pink chip, or `- - -` when empty. */
function ChipCell({ values }: { values: string[] }) {
  if (values.length === 0) return <span className="text-gray-400">- - -</span>
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((v, i) => (
        <span key={i} className={CHIP} title={v}>
          {v}
        </span>
      ))}
    </div>
  )
}
