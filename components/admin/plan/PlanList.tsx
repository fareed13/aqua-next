'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  BookCopy, Search, Plus, ArrowUpDown, ChevronUp, ChevronDown,
  Pencil, Trash2, Type, DollarSign, Tag, Hash, Gift, CheckCircle,
} from 'lucide-react'
import { useOrgStore, useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { ReorderPlansDialog } from '@/components/admin/plan/ReorderPlansDialog'

/**
 * A row from the admin /plan/ endpoint. `services` is the join to the programs
 * this plan appears under; the backend returns either bare ids or {service, order}
 * objects, and Nuxt tolerates both — so we do too.
 */
interface AdminPlan {
  id: number
  name: string
  price: string
  discounted_price: string | null
  amount_of_units: number
  unit_of_time: string
  free_items: string[]
  is_trial: boolean
  is_default: boolean
  services?: Array<number | { service: number; order: number }>
  /** Injected client-side when filtering by service — not a backend field. */
  order?: number
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 20]

/** Nuxt's v-data-table `:search` matches the stringified value of any column. */
function matchesSearch(plan: AdminPlan, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return [
    plan.name, plan.price, plan.discounted_price,
    plan.amount_of_units, plan.unit_of_time,
    plan.free_items?.join(' '), plan.is_trial ? 'Yes' : 'No',
  ].some(v => String(v ?? '').toLowerCase().includes(needle))
}

/** Green pill toggle — stands in for Vuetify's `v-switch color="success"`. */
function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="relative inline-block w-9 h-5 shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-green-600 transition-colors" />
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  )
}

function Pagination({
  page, totalPages, itemsPerPage, paginationRange, onPageChange, onItemsPerPageChange,
}: {
  page: number
  totalPages: number
  itemsPerPage: number
  paginationRange: string
  onPageChange: (p: number) => void
  onItemsPerPageChange: (v: number) => void
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
      <p className="m-0">Rows Per Page:</p>
      <select
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        value={itemsPerPage}
        onChange={e => onItemsPerPageChange(Number(e.target.value))}
      >
        {ITEMS_PER_PAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <p className="m-0 ml-8">{paginationRange}</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className="px-2 py-1 rounded disabled:opacity-40"
        >
          <ChevronUp size={16} className="-rotate-90" />
        </button>
        <span className="text-sm">{page} / {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="px-2 py-1 rounded disabled:opacity-40"
        >
          <ChevronDown size={16} className="-rotate-90" />
        </button>
      </div>
    </div>
  )
}

/**
 * Plans admin list — ports Nuxt components/plan/planList.vue.
 *
 * Layout mirrors Nuxt: a teal header bar, then a desktop split of filter
 * sidebar + data table, and a separate card list for mobile. Both views share
 * one page/search/filter state, as in Nuxt.
 */
export function PlanList() {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const storeServices = useOrgServices()
  const { getSecure, deleteSecure, patchSecure } = useSecureCalls()

  const currencySign = organization?.currency_sign ?? '$'

  const [allPlans, setAllPlans] = useState<AdminPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isTrialFilter, setIsTrialFilter] = useState(false)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<AdminPlan | null>(null)
  const [deletePopup, setDeletePopup] = useState(false)
  const [reorderDialog, setReorderDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const loadPlans = useCallback(async (): Promise<AdminPlan[]> => {
    try {
      const data = await getSecure<AdminPlan[]>(SECURE_ENDPOINTS.PLAN)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching plans:', error)
      return []
    }
  }, [getSecure])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const data = await loadPlans()
      if (!cancelled) setAllPlans(data)
    })()
    return () => { cancelled = true }
  }, [loadPlans])

  /** Nuxt's onReorderSaved — re-GETs the plans so the new order is reflected. */
  const refreshPlans = useCallback(async () => {
    setAllPlans(await loadPlans())
  }, [loadPlans])

  // Nuxt: only plans attached to a service (or the current default) can be the default.
  const allPlansDropdown = useMemo(
    () => allPlans.filter(p => (p.services?.length ?? 0) > 0 || p.is_default),
    [allPlans],
  )

  // Nuxt prepends an "All" entry with a null id and hides child services.
  const filteredServices = useMemo(
    () => [{ name: 'All', id: null as number | null }, ...storeServices.filter(s => !s.parent_service)],
    [storeServices],
  )

  const filteredPlans = useMemo(() => {
    let result: AdminPlan[] = allPlans
    if (selectedService) {
      const serviceId = Number(selectedService)
      const matches = (s: number | { service: number; order: number }) =>
        typeof s === 'object' && s !== null ? Number(s.service) === serviceId : Number(s) === serviceId
      result = result
        .filter(plan => plan.services?.some?.(matches))
        .map(plan => {
          const svc = plan.services?.find?.(matches)
          return { ...plan, order: typeof svc === 'object' && svc !== null ? svc.order : 0 }
        })
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }
    if (isTrialFilter) result = result.filter(plan => plan.is_trial)
    return result
  }, [allPlans, selectedService, isTrialFilter])

  const searchedPlans = useMemo(
    () => filteredPlans.filter(p => matchesSearch(p, search)),
    [filteredPlans, search],
  )

  const totalPages = Math.max(1, Math.ceil(searchedPlans.length / itemsPerPage))
  const pagedPlans = useMemo(
    () => searchedPlans.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [searchedPlans, page, itemsPerPage],
  )

  const paginationRange = (() => {
    if (searchedPlans.length === 0) return '0 - 0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(page * itemsPerPage, searchedPlans.length)
    return `${start} - ${end} of ${searchedPlans.length}`
  })()

  const defaultPlan = allPlans.find(p => p.is_default) ?? null

  /** Nuxt's `defaultPlan` setter: PATCH the new default, then flip the flag locally. */
  const onDefaultPlanChange = async (planId: number) => {
    const newPlan = allPlansDropdown.find(p => p.id === planId)
    if (!newPlan) return
    try {
      setLoading(true)
      await patchSecure(SECURE_ENDPOINTS.PLAN, { id: newPlan.id, is_default: true })
      toast.success('Default plan changed successfully', { duration: 15000 })
      setAllPlans(prev => prev.map(p => ({ ...p, is_default: p.id === newPlan.id })))
    } catch (error) {
      console.error('Error updating plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDeletePopup = (item: AdminPlan | null) => {
    setSelectedPlan(item)
    setDeletePopup(!!item)
  }

  const deleteSelectedPlan = async () => {
    if (!selectedPlan) return
    try {
      setLoading(true)
      await deleteSecure(SECURE_ENDPOINTS.PLAN, selectedPlan.id)
      setAllPlans(prev => prev.filter(rc => rc.id !== selectedPlan.id))
      toast.success('Deleted successfully', { duration: 15000 })
      toggleDeletePopup(null)
    } catch {
      /* Nuxt swallows this too */
    } finally {
      setLoading(false)
    }
  }

  // Nuxt's getPlans() does NOT refetch — it only resets to page 1.
  const resetPage = () => setPage(1)

  const showAll = () => {
    setSelectedService(null)
    setIsTrialFilter(false)
    setSearch('')
    setPage(1)
    setShowFilters(false)
  }

  const field = 'w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white'

  const serviceSelect = (className: string) => (
    <select
      className={className}
      value={selectedService ?? ''}
      onChange={e => { setSelectedService(e.target.value === '' ? null : Number(e.target.value)); resetPage() }}
    >
      {filteredServices.map(s => (
        <option key={String(s.id)} value={s.id ?? ''}>{s.name}</option>
      ))}
    </select>
  )

  const defaultPlanSelect = (className: string) => (
    <select
      className={className}
      value={defaultPlan?.id ?? ''}
      onChange={e => e.target.value !== '' && onDefaultPlanChange(Number(e.target.value))}
    >
      <option value="">Default Plan</option>
      {allPlansDropdown.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  )

  return (
    <div>
      {reorderDialog && (
        <ReorderPlansDialog
          onClose={() => setReorderDialog(false)}
          onSaved={refreshPlans}
        />
      )}
      <DeleteWarning
        popup={deletePopup}
        onConfirm={deleteSelectedPlan}
        onCancel={() => toggleDeletePopup(null)}
        loading={loading}
        message="Do You Really want to delete this item?"
      />

      {/* Header */}
      <div className="p-4" style={{ backgroundColor: '#124e66' }}>
        <div className="mx-auto flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center">
            <BookCopy className="mr-3 text-white" size={32} />
            <div>
              <h1 className="text-xl text-white mb-1">Plans</h1>
              <p className="text-sm text-white/70 mb-0">Manage plans</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:items-center">
            <div className="relative w-full min-w-[300px]">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/60" />
              <input
                className="w-full bg-white border border-gray-300 rounded pl-10 pr-3 py-2 text-sm"
                placeholder="Search plans..."
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage() }}
              />
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin/plan/new')}
              aria-label="Add new plan"
              className="flex items-center justify-center gap-1 bg-white text-gray-900 px-4 py-2 rounded font-semibold text-sm uppercase whitespace-nowrap"
            >
              <Plus size={18} /> Add Plan
            </button>
            <button
              type="button"
              onClick={() => setReorderDialog(true)}
              aria-label="Re-order plans"
              className="flex items-center justify-center gap-1 border border-white text-white px-4 py-2 rounded font-semibold text-sm uppercase whitespace-nowrap"
            >
              <ArrowUpDown size={18} /> Re-order Plans
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      <div className="block md:hidden">
        <div className="px-3 pt-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/60" />
            <input
              className="w-full h-10 rounded-full shadow border border-gray-200 pl-10 pr-3 text-sm"
              placeholder="Search Plans"
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage() }}
            />
          </div>
        </div>
        <div className="pt-2 pb-2 bg-white">
          <div className="flex items-center px-3 py-2 bg-white">
            <button
              type="button"
              onClick={showAll}
              className={`px-3 py-1 rounded-full text-sm border ${!showFilters ? 'bg-[#124e66] text-white border-[#124e66]' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
            >
              All Plans
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className={`ml-2 px-3 py-1 rounded-full text-sm border inline-flex items-center gap-1 ${showFilters ? 'bg-[#124e66] text-white border-[#124e66]' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
            >
              More Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="p-3 my-4 mt-0 mx-3 bg-white rounded shadow">
            <div className="flex flex-row gap-2 mb-2">
              <div className="flex-1">
                <Switch label="Is Trial" checked={isTrialFilter} onChange={v => { setIsTrialFilter(v); resetPage() }} />
              </div>
              <div className="flex-1">{defaultPlanSelect(field)}</div>
            </div>
            <div className="flex flex-row gap-2 mb-2">
              <div className="flex-1">{serviceSelect(field)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 bg-[#f5f5f5]">
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="flex gap-4">
            <div className="w-2/12 bg-[#f5f5f8] p-6 rounded-lg min-h-[400px]">
              <div className="mt-1 space-y-6">
                <Switch label="Is trial..." checked={isTrialFilter} onChange={v => { setIsTrialFilter(v); resetPage() }} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Service...</label>
                  {serviceSelect(field)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Plan</label>
                  {defaultPlanSelect(field)}
                </div>
              </div>
            </div>

            <div className="w-10/12 bg-white rounded-lg shadow p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b">
                    <tr>
                      {/* Nuxt prepends an Order column only while filtering by service. */}
                      {selectedService && <th className="px-4 py-3 text-sm font-semibold">Order</th>}
                      <th className="px-4 py-3 text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-sm font-semibold">Price</th>
                      <th className="px-4 py-3 text-sm font-semibold">Discounted Price</th>
                      <th className="px-4 py-3 text-sm font-semibold">Units</th>
                      <th className="px-4 py-3 text-sm font-semibold">Unit of time</th>
                      <th className="px-4 py-3 text-sm font-semibold">Free items</th>
                      <th className="px-4 py-3 text-sm font-semibold">Is trial?</th>
                      <th className="px-4 py-3 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedPlans.length === 0 ? (
                      <tr>
                        <td colSpan={selectedService ? 9 : 8} className="px-4 py-8 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    ) : pagedPlans.map(plan => (
                      <tr key={plan.id} className="border-b hover:bg-gray-50">
                        {selectedService && <td className="px-4 py-3">{plan.order}</td>}
                        <td className="px-4 py-3">{plan.name}</td>
                        <td className="px-4 py-3">{plan.price}</td>
                        <td className="px-4 py-3">{plan.discounted_price}</td>
                        <td className="px-4 py-3">{plan.amount_of_units}</td>
                        <td className="px-4 py-3">{plan.unit_of_time}</td>
                        <td className="px-4 py-3">
                          {plan.free_items?.map((fitem, i) => (
                            <span key={i} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded-full bg-gray-200 text-xs">
                              {fitem}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-3">{plan.is_trial ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/plan/${plan.id}`)}
                              aria-label={`Edit plan ${plan.name || plan.id}`}
                              className="p-1 text-gray-700"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleDeletePopup(plan)}
                              aria-label={`Delete plan ${plan.name || plan.id}`}
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
              <Pagination
                page={page} totalPages={totalPages} itemsPerPage={itemsPerPage}
                paginationRange={paginationRange}
                onPageChange={setPage}
                onItemsPerPageChange={v => { setPage(1); setItemsPerPage(v) }}
              />
            </div>
          </div>
        </div>

        {/* Mobile / tablet cards */}
        <div className="block md:hidden">
          <div className="mt-[25px] px-3 py-2">
            {pagedPlans.map(plan => (
              <div key={plan.id} className="rounded-[14px] bg-white shadow-sm border border-gray-200 text-[13px] p-[14px] mb-4">
                <div className="flex items-center mb-1">
                  <Type size={16} className="mr-2 text-gray-500" />
                  <span className="text-[15px]">{plan.name || ''}</span>
                </div>
                <div className="flex items-center mb-1">
                  <DollarSign size={16} className="mr-2 text-gray-500" />
                  <span className="text-[13px]">{currencySign}{plan.price || '0'}</span>
                </div>
                <div className="flex items-center mb-1">
                  <Tag size={16} className="mr-2 text-gray-500" />
                  <span className="text-[13px]">{currencySign}{plan.discounted_price || plan.price || '0'}</span>
                </div>
                <div className="flex items-center mb-1">
                  <Hash size={16} className="mr-2 text-gray-500" />
                  <span className="text-[13px]">{plan.amount_of_units || '0'} {plan.unit_of_time || ''}</span>
                </div>
                <div className="flex items-center mb-1">
                  <Gift size={16} className="mr-2 text-gray-500" />
                  <span className="text-[13px]">{plan.free_items?.length || '0'} free items</span>
                </div>
                {plan.free_items && plan.free_items.length > 0 && (
                  <div className="flex flex-col mb-2">
                    <div className="flex items-center mb-1">
                      <Gift size={16} className="mr-2 text-gray-500" />
                      <span className="text-xs text-[#666]">Free Items:</span>
                    </div>
                    <div>
                      {plan.free_items.map((fitem, i) => (
                        <span key={i} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded-full border border-green-600 text-green-700 text-[10px]">
                          {fitem}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center mb-2">
                  <CheckCircle size={16} className="mr-2 text-gray-500" />
                  <span className="text-[13px]">{plan.is_trial ? 'Trial Plan' : 'Regular Plan'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block px-3 py-0.5 rounded-xl text-xs font-medium ${plan.is_trial ? 'bg-[#e6f4ea] text-[#2e7d32]' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {plan.is_trial ? 'Trial' : 'Regular'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button" title="Edit" onClick={() => router.push(`/admin/plan/${plan.id}`)} className="p-1 text-gray-700">
                      <Pencil size={18} />
                    </button>
                    <button type="button" title="Delete" onClick={() => toggleDeletePopup(plan)} className="p-1 text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <Pagination
              page={page} totalPages={totalPages} itemsPerPage={itemsPerPage}
              paginationRange={paginationRange}
              onPageChange={setPage}
              onItemsPerPageChange={v => { setPage(1); setItemsPerPage(v) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
