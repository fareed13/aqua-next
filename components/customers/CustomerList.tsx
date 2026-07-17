'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Mail, Pencil, Trash2, Plus, Menu, Search, ChevronDown, ChevronUp,
  User, Phone, Calendar, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { SendSmsPopup } from './SendSmsPopup'
import { MultiSelectChips } from './MultiSelectChips'

interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  location?: number
  updated_at?: string
  utm_source_spam?: boolean
  aquila_member_id?: number | boolean | null
  cookie?: { utm_source?: string } | null
  [key: string]: unknown
}

interface RankOrTag { id: number; name: string }

const ROWS_PER_PAGE_OPTIONS = ['5', '10', '15', 'All'] as const

function formatDate(dateStr?: string): string {
  if (!dateStr) return '--- --- ---'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '--- --- ---'
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(h % 12 || 12)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`
}

/** utm_source → readable lead source, mirroring Nuxt's inline map. */
function leadSource(c: Contact, spam: boolean): string {
  if (spam) return 'Spam'
  const src = c.cookie?.utm_source
  if (!src) return ''
  if (src === 'google') return 'Google Ads'
  if (src === 'fb') return 'Facebook Ads'
  return src
}

export function CustomerList() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const locations = useOrgStore(s => s.locations)
  const { getSecure, postSecure, putSecure, deleteSecure } = useSecureCalls()

  // Data + paging (server-driven, like Nuxt getCustomers)
  const [customers, setCustomers] = useState<Contact[]>([])
  const [dataCount, setDataCount] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState<string>('10')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [overlay, setOverlay] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [spam, setSpam] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [selectedRank, setSelectedRank] = useState<number | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<number | null>(null)
  const [ranks, setRanks] = useState<RankOrTag[]>([])
  const [tags, setTags] = useState<RankOrTag[]>([])

  // Bulk update
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [filterType, setFilterType] = useState<'' | 'tags' | 'belts'>('')
  const [selectedFilterValue, setSelectedFilterValue] = useState<number[]>([])

  // Aquila integration gating
  const [integrationsMap, setIntegrationsMap] = useState<Record<number, any[]>>({})
  const [aquilaLoadingId, setAquilaLoadingId] = useState<number | null>(null)

  // Dialogs
  const [deletePopup, setDeletePopup] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Contact | null>(null)
  const [spamButtonClick, setSpamButtonClick] = useState(false)
  const [removeSpamButtonClick, setRemoveSpamButtonClick] = useState(false)
  const [removeSpamRowClick, setRemoveSpamRowClick] = useState(false)
  const [messageDialog, setMessageDialog] = useState(false)

  // Mobile "More Filters" toggle + desktop sidebar collapsible panels (Nuxt expansion-panels).
  const [showFilters, setShowFilters] = useState(false)
  const [beltOpen, setBeltOpen] = useState(true)
  const [tagOpen, setTagOpen] = useState(true)

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Latest filter values for getCustomers, avoiding stale closures across the
  // many callers (watchers, pagination, search debounce).
  const filters = useRef({ spam, selectedLocation, selectedRank, selectedLabel, search, itemsPerPage, page })
  filters.current = { spam, selectedLocation, selectedRank, selectedLabel, search, itemsPerPage, page }

  const getCustomers = useCallback(async () => {
    setLoading(true)
    setCustomers([])
    const f = filters.current
    try {
      const res = await getSecure<{ count: number; results: Contact[] }>(SECURE_ENDPOINTS.CUSTOMER, {
        size: f.itemsPerPage,
        page: f.page,
        location_id: f.selectedLocation ?? undefined,
        belts: f.selectedRank ?? undefined,
        tags: f.selectedLabel ?? undefined,
        search: f.search ? f.search : undefined,
        spam: f.spam ? 'true' : 'false',
      })
      setDataCount((res as any)?.count ?? 0)
      setCustomers((res as any)?.results ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [getSecure])

  const fetchIntegrations = useCallback(async () => {
    const map: Record<number, any[]> = {}
    await Promise.all(
      (locations ?? []).map(async loc => {
        try {
          const res = await getSecure<any[]>(SECURE_ENDPOINTS.LOCATION_SECURE, { id: loc.id })
          map[loc.id] = res?.[0]?.integrations ?? []
        } catch {
          map[loc.id] = []
        }
      })
    )
    setIntegrationsMap(map)
  }, [locations, getSecure])

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/'); return }
    ;(async () => {
      setOverlay(true)
      await getCustomers()
      try {
        const [t, r] = await Promise.all([
          getSecure<RankOrTag[]>(SECURE_ENDPOINTS.TAGS),
          getSecure<RankOrTag[]>(SECURE_ENDPOINTS.SERVICE_RANK),
        ])
        setTags(Array.isArray(t) ? t : [])
        setRanks(Array.isArray(r) ? r : [])
      } catch { /* handled */ }
      await fetchIntegrations()
      setOverlay(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-query when a server-side filter changes (Nuxt watchers on location/rank/label/spam/page).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    getCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, selectedRank, selectedLabel, spam, page, itemsPerPage])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(dataCount / (itemsPerPage || 1))),
    [dataCount, itemsPerPage]
  )
  const paginationRange = useMemo(() => {
    if (dataCount === 0) return '0 - 0 of 0'
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(page * itemsPerPage, dataCount)
    return `${start} - ${end} of ${dataCount}`
  }, [page, itemsPerPage, dataCount])

  // ---- handlers ----
  const onSearchInput = (val: string) => {
    setSearch(val)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => {
      setPage(1)
      getCustomers()
    }, 400)
  }

  const changeItemsPerPage = (val: string) => {
    setRowsPerPage(val)
    setPage(1)
    setItemsPerPage(val === 'All' ? (dataCount || 1) : Number(val))
  }

  const toggleSpam = () => {
    setSelectedRows([])
    setPage(1)
    setSpam(s => !s)
  }

  const showAll = () => {
    setSelectedLocation(null)
    setSelectedRank(null)
    setSelectedLabel(null)
    setSearch('')
    setPage(1)
    setSpam(false)
    // spam=false may already match; force a refetch regardless.
    getCustomers()
  }

  const beltClick = (rankId: number) =>
    setSelectedRank(prev => (prev === rankId ? null : rankId))
  const tagClick = (tagId: number) =>
    setSelectedLabel(prev => (prev === tagId ? null : tagId))

  const editClick = (c: Contact) =>
    router.push(`/customers/${c.id}/?spam=${spam}`)
  const addClick = () => router.push('/customers/new')

  const toggleRow = (id: number) =>
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const allRowsSelected = customers.length > 0 && customers.every(c => selectedRows.includes(c.id))
  const toggleAllRows = () =>
    setSelectedRows(allRowsSelected ? [] : customers.map(c => c.id))

  const setValuesForDropdown = (type: '' | 'tags' | 'belts') => {
    setFilterType(type)
    setSelectedFilterValue([])
  }
  const valuesToUpdate = filterType === 'belts' ? ranks : filterType === 'tags' ? tags : []

  const applyBulkUpdate = async () => {
    setOverlay(true)
    try {
      await putSecure(SECURE_ENDPOINTS.CUSTOMER_BULK_UPLOAD, {
        customers: selectedRows,
        tags: filterType === 'tags' ? selectedFilterValue : [],
        belts: filterType === 'belts' ? selectedFilterValue : [],
      })
      toast.success('Customers updated successfully', { duration: 10000 })
      await getCustomers()
      setSelectedRows([])
      setSelectedFilterValue([])
      setFilterType('')
    } catch {
      toast.error('Customers could not updated', { duration: 10000 })
    } finally {
      setOverlay(false)
    }
  }

  // ---- delete / spam dialog wiring ----
  const revertSpamRemoveState = () => {
    setRemoveSpamButtonClick(false)
    setRemoveSpamRowClick(false)
  }
  const toggleDeletePopup = (item: Contact | null) => {
    setSpamButtonClick(false)
    setSelectedCustomer(item)
    setDeletePopup(!!item)
  }
  const deleteSpamButton = () => { setSpamButtonClick(true); setDeletePopup(true) }
  const removeSpamRow = (item: Contact) => {
    setRemoveSpamRowClick(true)
    setSelectedCustomer(item)
    setDeletePopup(!!item)
  }

  const closeDeletePopup = () => {
    setDeletePopup(false)
    setSelectedCustomer(null)
    setSpamButtonClick(false)
    revertSpamRemoveState()
  }

  const deleteContact = async () => {
    if (!selectedCustomer) return
    setOverlay(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.CUSTOMER, selectedCustomer.id)
      toast.success('User deleted Successfully', { duration: 15000 })
      setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id))
      setSelectedRows([])
      closeDeletePopup()
    } catch { /* handled */ } finally { setOverlay(false) }
  }

  const deleteSpamContact = async () => {
    setOverlay(true)
    try {
      await deleteSecure(SECURE_ENDPOINTS.SPAM_BULK_DELETE, selectedRows as any)
      toast.success('User deleted Successfully', { duration: 15000 })
      setCustomers(prev => prev.filter(c => !selectedRows.includes(c.id)))
      setSelectedRows([])
      closeDeletePopup()
      getCustomers()
    } catch { /* handled */ } finally { setOverlay(false) }
  }

  const removeContactFromSpam = async () => {
    setOverlay(true)
    const ids = removeSpamRowClick && selectedCustomer ? [selectedCustomer.id] : selectedRows
    try {
      await putSecure(SECURE_ENDPOINTS.REMOVE_FROM_SPAM, { customer_ids: ids })
      toast.success('Marked as not spam and moved to leads', { duration: 15000 })
      setSelectedRows([])
      closeDeletePopup()
      getCustomers()
    } catch { /* handled */ } finally { setOverlay(false) }
  }

  const deleteMessage = spamButtonClick
    ? `Do You Really want to delete selected item${selectedRows.length > 1 ? 's' : ''}?`
    : (removeSpamButtonClick || removeSpamRowClick)
      ? `Do You Really want to remove selected item${selectedRows.length > 1 ? 's' : ''} from spam?`
      : 'Do You Really want to delete this item?'
  const onDeleteConfirm = spamButtonClick
    ? deleteSpamContact
    : (removeSpamButtonClick || removeSpamRowClick)
      ? removeContactFromSpam
      : deleteContact

  // ---- aquila ----
  const locationHasAquila = (locationId?: number) => {
    const integrations = integrationsMap[locationId ?? -1] ?? []
    const aquila = integrations.find(i => i.name === 'aquila')
    return !!(aquila && aquila['X-API-KEY'] && aquila.locationId)
  }
  const sendToAquila = async (item: Contact) => {
    setAquilaLoadingId(item.id)
    try {
      const res = await postSecure<any>(SECURE_ENDPOINTS.INVOKE_AQUILA, {
        ids: [item.id],
        location_id: item.location,
      })
      if (res?.success === false) {
        toast.error(res?.message || 'Could not send to Aquila, please try again', { duration: 5000 })
      } else {
        toast.success(res?.message || 'Successfully sent to Aquila', { duration: 5000 })
        setCustomers(prev => prev.map(c =>
          c.id === item.id ? { ...c, aquila_member_id: res?.aquila_member_id || true } : c
        ))
      }
    } catch { /* handled */ } finally { setAquilaLoadingId(null) }
  }

  const toggleMessageDialog = (item: Contact | null) => {
    setSelectedCustomer(item)
    setMessageDialog(!!item)
  }

  const locationTitle = (l: any) =>
    (l.target_locations && l.target_locations[0]) || l.city

  // Nuxt's source-badge palette (organic green / google blue / fb purple).
  const sourceBadge = (c: Contact) => {
    if (spam) return { text: 'Spam', cls: 'bg-[#e6f4ea] text-[#2e7d32]' }
    const src = c.cookie?.utm_source
    if (src === 'google') return { text: 'Google Ads', cls: 'bg-[#e3f0fd] text-[#1976d2]' }
    if (src === 'fb') return { text: 'Facebook Ads', cls: 'bg-[#f3e6fd] text-[#7b1fa2]' }
    return { text: src || '', cls: 'bg-[#e6f4ea] text-[#2e7d32]' }
  }

  // ---- shared field styles ----
  const selectCls =
    'w-full rounded border border-gray-300 bg-white px-3 py-3 text-[15px] outline-none ' +
    'focus:border-[#124e66] disabled:bg-gray-100 disabled:text-gray-400'
  const listRow = (active: boolean) =>
    `flex items-center gap-2 w-full text-left px-3 py-2 rounded cursor-pointer text-[15px] ` +
    (active ? 'bg-[#d2e0f2] font-semibold' : 'hover:bg-[#eef2fb]')

  // ---- reusable blocks (called as functions, not components, to avoid remounts) ----
  const bulkRow = () => (
    <div className="flex flex-col md:flex-row gap-3 items-stretch p-4">
      <select
        value={filterType}
        disabled={!selectedRows.length}
        onChange={e => setValuesForDropdown(e.target.value as '' | 'tags' | 'belts')}
        className={`md:w-1/3 ${selectCls}`}
      >
        <option value="">Select the type</option>
        <option value="tags">Tags</option>
        <option value="belts">Belts</option>
      </select>
      <div className="md:w-5/12">
        <MultiSelectChips
          options={valuesToUpdate}
          value={selectedFilterValue}
          onChange={setSelectedFilterValue}
          disabled={!selectedRows.length}
        />
      </div>
      <button
        onClick={applyBulkUpdate}
        disabled={!selectedRows.length || !selectedFilterValue.length}
        className="md:w-1/4 rounded bg-[#f50264] px-4 py-3 font-medium uppercase text-white disabled:bg-black/10 disabled:text-black/30"
      >
        Apply Bulk Update
      </button>
    </div>
  )

  const deleteSpamRow = () =>
    selectedRows.length > 0 && customers.length > 0 && spam ? (
      <div className="flex justify-end px-4 pb-2">
        <button
          onClick={deleteSpamButton}
          className="rounded bg-black/10 px-6 py-3 text-[13px] font-medium text-black/60 hover:bg-black/20"
        >
          Delete Potential Spam
        </button>
      </div>
    ) : null

  const pageWindow = () => {
    const pages: number[] = []
    const end = Math.min(totalPages, Math.max(5, page + 2))
    const start = Math.max(1, end - 4)
    for (let p = start; p <= end; p++) pages.push(p)
    return pages
  }

  const tableFooter = () => (
    <div className="flex flex-wrap items-center justify-end gap-3 px-4 py-4 text-sm text-gray-600">
      <span>Rows Per Page:</span>
      <select
        className="rounded border border-gray-300 px-2 py-1"
        value={rowsPerPage}
        onChange={e => changeItemsPerPage(e.target.value)}
      >
        {ROWS_PER_PAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="mx-2">{paginationRange}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="h-8 w-8 rounded-full border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          aria-label="Previous page"
        >
          {'‹'}
        </button>
        {pageWindow().map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`h-8 w-8 rounded-full text-sm ${
              p === page ? 'bg-[#124e66] text-white' : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="h-8 w-8 rounded-full border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
          aria-label="Next page"
        >
          {'›'}
        </button>
      </div>
    </div>
  )

  // Filter controls shared by the mobile filter card and (partly) the desktop sidebar.
  const rankTagChips = () => (
    <>
      <div className="rounded border border-gray-200 bg-white">
        <button
          onClick={() => setBeltOpen(o => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-[13px] font-semibold tracking-wide text-gray-700"
        >
          BELT RANK
          {beltOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {beltOpen && (
          <div className="max-h-56 overflow-y-auto px-2 pb-2">
            {ranks.length === 0 && <p className="px-1 py-1 text-xs text-gray-400">No ranks</p>}
            {ranks.map(r => (
              <button key={r.id} onClick={() => beltClick(r.id)} className={listRow(selectedRank === r.id)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/img/family.png" alt="" width={14} height={14} className="shrink-0" />
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="rounded border border-gray-200 bg-white">
        <button
          onClick={() => setTagOpen(o => !o)}
          className="flex w-full items-center justify-between px-3 py-2 text-[13px] font-semibold tracking-wide text-gray-700"
        >
          TAGS
          {tagOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {tagOpen && (
          <div className="max-h-56 overflow-y-auto px-2 pb-2">
            {tags.length === 0 && <p className="px-1 py-1 text-xs text-gray-400">No tags</p>}
            {tags.map(t => (
              <button key={t.id} onClick={() => tagClick(t.id)} className={listRow(selectedLabel === t.id)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/img/family.png" alt="" width={14} height={14} className="shrink-0" />
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )

  const spamSwitch = () => (
    <label className="flex cursor-pointer items-center gap-2 text-[15px]">
      <span className="relative inline-flex">
        <input type="checkbox" checked={spam} onChange={toggleSpam} className="peer sr-only" />
        <span className="h-5 w-9 rounded-full bg-gray-300 transition peer-checked:bg-[#4caf50]" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
      </span>
      Potential Spam
    </label>
  )

  return (
    <div className="relative min-h-screen bg-[#f5f4f8]">
      {/* Teal band behind the top of the content (Nuxt .contact-main:before) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[150px] bg-[#124e66] md:block" />

      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      <DeleteWarning
        popup={deletePopup}
        message={deleteMessage}
        loading={overlay}
        onConfirm={onDeleteConfirm}
        onCancel={closeDeletePopup}
      />
      {selectedCustomer && (
        <SendSmsPopup
          smsDialog={messageDialog}
          customer={selectedCustomer as any}
          toggleDialog={() => toggleMessageDialog(null)}
        />
      )}

      <div className="relative mx-auto max-w-[1400px] px-0 md:px-4 md:py-4">
        {/* ============================= MOBILE ============================= */}
        <div className="md:hidden">
          <div className="bg-[#124e66] px-3 pb-3 pt-3">
            <div className="flex justify-end">
              <button onClick={addClick} className="flex items-center gap-1 rounded bg-white/15 px-3 py-2 text-sm font-medium text-white">
                <Plus size={16} /> Add Contact
              </button>
            </div>
            <div className="mt-2 flex items-center rounded-full bg-white px-3">
              <Search size={18} className="text-black/50" />
              <input
                value={search}
                onChange={e => onSearchInput(e.target.value)}
                placeholder="Search Contacts"
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2">
            <button
              onClick={showAll}
              className={`rounded-2xl px-4 py-1 text-[15px] font-medium ${!showFilters ? 'bg-[#e6edfd] text-[#2a4d9b]' : 'bg-[#f5f6fa] text-gray-600'}`}
            >
              All Contacts
            </button>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1 rounded-2xl px-4 py-1 text-[15px] font-medium ${showFilters ? 'bg-[#e6edfd] text-[#2a4d9b]' : 'bg-[#f5f6fa] text-gray-600'}`}
            >
              More Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showFilters && (
            <div className="m-3 space-y-3 rounded bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-3">
                {spamSwitch()}
                {locations && locations.length > 1 && (
                  <select
                    value={selectedLocation ?? ''}
                    onChange={e => { setSelectedLocation(e.target.value ? Number(e.target.value) : null); setPage(1) }}
                    className={`flex-1 ${selectCls}`}
                  >
                    <option value="">All Locations</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{locationTitle(l)}</option>)}
                  </select>
                )}
              </div>
              {rankTagChips()}
            </div>
          )}

          {/* bulk update + cards */}
          <div className="mt-4 bg-white pb-4 shadow-sm">
            {bulkRow()}
            {deleteSpamRow()}
            <div className="grid grid-cols-1 gap-3 px-3">
              {loading ? (
                <p className="py-10 text-center text-gray-500">Loading…</p>
              ) : customers.length === 0 ? (
                <p className="py-10 text-center text-gray-500">No contacts found</p>
              ) : (
                customers.map(c => {
                  const badge = sourceBadge(c)
                  return (
                    <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-3.5 text-[13px] shadow-sm">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(c.id)}
                        onChange={() => toggleRow(c.id)}
                        className="mb-1 h-4 w-4"
                        aria-label={`Select ${c.first_name} ${c.last_name}`}
                      />
                      <div className="mb-1 flex items-center gap-1"><User size={16} className="text-gray-500" /><span className="text-[15px]">{c.first_name} {c.last_name}</span></div>
                      <div className="mb-1 flex items-center gap-1"><Phone size={15} className="text-gray-500" />{c.phone}</div>
                      <div className="mb-1 flex items-center gap-1"><Mail size={15} className="text-gray-500" />{c.email}</div>
                      <div className="mb-2 flex items-center gap-1"><Calendar size={15} className="text-gray-500" />{c.updated_at ? formatDate(c.updated_at) : '---'}</div>
                      <div className="flex items-center justify-between">
                        {badge.text && <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.text}</span>}
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleMessageDialog(c)} aria-label="Message"><Mail size={18} className="text-[#03dac6]" /></button>
                          {c.utm_source_spam && <button onClick={() => removeSpamRow(c)} aria-label="Not spam"><ShieldCheck size={18} className="text-green-600" /></button>}
                          <button onClick={() => editClick(c)} aria-label="Edit"><Pencil size={18} className="text-[#6200ee]" /></button>
                          <button onClick={() => toggleDeletePopup(c)} aria-label="Delete"><Trash2 size={18} className="text-[#b00020]" /></button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {tableFooter()}
          </div>
        </div>

        {/* ============================= DESKTOP ============================= */}
        <div className="hidden md:flex md:gap-4">
          {/* Left sidebar */}
          <aside className="w-[220px] shrink-0 px-3">
            <div className="pt-3">
              <h3 className="flex items-center gap-2 text-lg font-normal text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/img/c-box-icon.png" alt="" width={20} height={20} className="object-contain" />
                Contacts
              </h3>
              <button
                onClick={addClick}
                className="mt-8 mb-3 flex h-9 w-full items-center justify-center gap-1 rounded bg-white text-[15px] font-medium text-gray-800 shadow-sm"
              >
                <Plus size={16} className="text-[#124e66]" /> Add Contact
              </button>
            </div>

            <div className="rounded bg-[#f5f4f8]">
              <button onClick={showAll} className="mb-1 flex w-full items-center gap-2 rounded bg-[#dae4f3] px-3 py-2 text-[15px]">
                <Menu size={16} className="text-[#124e66]" /> All Contacts
              </button>

              {locations && locations.length > 1 && (
                <div className="px-1 py-2">
                  <select
                    value={selectedLocation ?? ''}
                    onChange={e => { setSelectedLocation(e.target.value ? Number(e.target.value) : null); setPage(1) }}
                    className="w-full border-0 border-b border-gray-300 bg-transparent px-1 py-2 text-[15px] outline-none focus:border-[#124e66]"
                  >
                    <option value="">Select Location</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{locationTitle(l)}</option>)}
                  </select>
                </div>
              )}

              <div className="px-3 py-3">{spamSwitch()}</div>
              <div className="px-3 pb-1 text-[12px] font-semibold tracking-wide text-gray-500">LABELS</div>
            </div>

            <div className="mt-2 space-y-2">{rankTagChips()}</div>
          </aside>

          {/* Right column */}
          <div className="min-w-0 flex-1 px-3">
            {/* centered search */}
            <div className="mx-auto mb-3 max-w-[400px] pt-3">
              <div className="flex items-center rounded-full bg-[#f5f4f8] px-4 shadow-sm ring-1 ring-black/5">
                <Search size={18} className="text-black/50" />
                <input
                  value={search}
                  onChange={e => onSearchInput(e.target.value)}
                  placeholder="Search Contacts"
                  className="w-full bg-transparent px-2 py-2 text-[15px] outline-none"
                />
              </div>
            </div>

            <div className="rounded bg-white shadow-[0px_3px_11px_#cccccc8f]">
              {bulkRow()}
              {deleteSpamRow()}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[15px]">
                  <thead className="border-b bg-gray-50 text-gray-700">
                    <tr>
                      <th className="w-10 px-3 py-3">
                        <input type="checkbox" checked={allRowsSelected} onChange={toggleAllRows} aria-label="Select all" />
                      </th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Phone</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Updated at</th>
                      <th className="px-4 py-3 font-semibold">Lead Source</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Loading…</td></tr>
                    ) : customers.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">No contacts found</td></tr>
                    ) : (
                      customers.map(c => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(c.id)}
                              onChange={() => toggleRow(c.id)}
                              aria-label={`Select ${c.first_name} ${c.last_name}`}
                            />
                          </td>
                          <td className="cursor-pointer px-4 py-3" onClick={() => editClick(c)}>{c.first_name} {c.last_name}</td>
                          <td className="px-4 py-3 font-bold">{c.phone}</td>
                          <td className="px-4 py-3">{c.email}</td>
                          <td className="whitespace-nowrap px-4 py-3">{formatDate(c.updated_at)}</td>
                          <td className="px-4 py-3">{leadSource(c, spam)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {c.utm_source_spam && (
                                <button onClick={() => removeSpamRow(c)} className="rounded bg-[#333] px-3 py-1 text-[13px] text-white">Not Spam</button>
                              )}
                              {!c.aquila_member_id && locationHasAquila(c.location) && (
                                <button
                                  onClick={() => sendToAquila(c)}
                                  disabled={aquilaLoadingId === c.id}
                                  className="rounded bg-teal-600 px-3 py-1 text-[13px] text-white disabled:opacity-50"
                                >
                                  {aquilaLoadingId === c.id ? 'Sending…' : 'Send Aquila'}
                                </button>
                              )}
                              <button onClick={() => toggleMessageDialog(c)} aria-label="Send message"><Mail size={22} className="text-gray-500 hover:text-gray-800" /></button>
                              <button onClick={() => editClick(c)} aria-label="Edit"><Pencil size={22} className="text-[#6200ee]" /></button>
                              <button onClick={() => toggleDeletePopup(c)} aria-label="Delete"><Trash2 size={22} className="text-[#d5242c]" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {tableFooter()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
