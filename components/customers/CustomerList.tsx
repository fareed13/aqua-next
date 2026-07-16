'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { SendSmsPopup } from './SendSmsPopup'

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

  const toggleRow = (id: number) =>
    setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

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

  const chipBtn = (active: boolean) =>
    `text-left w-full px-3 py-1.5 rounded text-sm ${active ? 'bg-[#d2e0f2] font-semibold' : 'hover:bg-gray-100'}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="w-16 h-16 border-4 border-[#124e66] border-t-transparent rounded-full animate-spin" />
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

      {/* Top bar */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={showAll} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium">
            All Contacts
          </button>
          <button
            onClick={toggleSpam}
            className={`px-4 py-2 rounded text-sm font-medium ${spam ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            title="Show potential spam contacts"
          >
            Potential Spam
          </button>
          {locations && locations.length > 1 && (
            <select
              className="border rounded px-3 py-2 text-sm bg-white"
              value={selectedLocation ?? ''}
              onChange={e => { setSelectedLocation(e.target.value ? Number(e.target.value) : null); setPage(1) }}
            >
              <option value="">All Locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {(l.target_locations && l.target_locations[0]) || l.city}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2 w-64 text-sm"
            placeholder="Search Contacts"
            value={search}
            onChange={e => onSearchInput(e.target.value)}
          />
          <button
            onClick={() => router.push('/customers/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm whitespace-nowrap"
          >
            + Add Contact
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-56 shrink-0 space-y-4">
          <div className="border rounded bg-white">
            <div className="px-3 py-2 border-b font-semibold text-sm">Belt Rank</div>
            <div className="p-2 max-h-48 overflow-y-auto">
              {ranks.length === 0 && <p className="text-xs text-gray-400 px-1">No ranks</p>}
              {ranks.map(r => (
                <button key={r.id} onClick={() => beltClick(r.id)} className={chipBtn(selectedRank === r.id)}>
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <div className="border rounded bg-white">
            <div className="px-3 py-2 border-b font-semibold text-sm">Tags</div>
            <div className="p-2 max-h-48 overflow-y-auto">
              {tags.length === 0 && <p className="text-xs text-gray-400 px-1">No tags</p>}
              {tags.map(t => (
                <button key={t.id} onClick={() => tagClick(t.id)} className={chipBtn(selectedLabel === t.id)}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Bulk toolbar */}
          {selectedRows.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3 p-3 border rounded bg-gray-50">
              <span className="text-sm font-medium">{selectedRows.length} selected</span>
              <select
                className="border rounded px-2 py-1.5 text-sm bg-white"
                value={filterType}
                onChange={e => setValuesForDropdown(e.target.value as '' | 'tags' | 'belts')}
              >
                <option value="">Select the type</option>
                <option value="tags">Tags</option>
                <option value="belts">Belts</option>
              </select>
              {filterType && (
                <select
                  multiple
                  className="border rounded px-2 py-1.5 text-sm bg-white min-w-[160px]"
                  value={selectedFilterValue.map(String)}
                  onChange={e =>
                    setSelectedFilterValue(Array.from(e.target.selectedOptions, o => Number(o.value)))
                  }
                >
                  {valuesToUpdate.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              )}
              <button
                onClick={applyBulkUpdate}
                disabled={!filterType || selectedFilterValue.length === 0}
                className="bg-black text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
              >
                Apply Bulk Update
              </button>
              {spam && (
                <button onClick={deleteSpamButton} className="bg-red-600 text-white px-4 py-1.5 rounded text-sm">
                  Delete Potential Spam
                </button>
              )}
            </div>
          )}

          <div className="bg-white border rounded shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-3 w-8"></th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Updated at</th>
                  <th className="px-4 py-3 font-semibold">Lead Source</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">Loading...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No contacts found</td></tr>
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
                      <td className="px-4 py-3 cursor-pointer" onClick={() => editClick(c)}>
                        {c.first_name} {c.last_name}
                      </td>
                      <td className="px-4 py-3">{c.phone}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(c.updated_at)}</td>
                      <td className="px-4 py-3">{leadSource(c, spam)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {c.utm_source_spam && (
                            <button
                              onClick={() => removeSpamRow(c)}
                              className="bg-gray-500 text-white text-xs px-2 py-1 rounded"
                            >
                              Not Spam
                            </button>
                          )}
                          {!c.aquila_member_id && locationHasAquila(c.location) && (
                            <button
                              onClick={() => sendToAquila(c)}
                              disabled={aquilaLoadingId === c.id}
                              className="bg-teal-600 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
                            >
                              {aquilaLoadingId === c.id ? 'Sending…' : 'Send Aquila'}
                            </button>
                          )}
                          <button onClick={() => toggleMessageDialog(c)} aria-label="Send message" className="text-gray-600 hover:text-black">
                            <Mail size={18} />
                          </button>
                          <button onClick={() => editClick(c)} aria-label="Edit" className="text-blue-600 hover:text-blue-800">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => toggleDeletePopup(c)} aria-label="Delete" className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-end gap-3 mt-3 text-sm">
            <span>Rows per page:</span>
            <select
              className="border rounded px-2 py-1"
              value={rowsPerPage}
              onChange={e => changeItemsPerPage(e.target.value)}
            >
              {ROWS_PER_PAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span>{paginationRange}</span>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              {'<'}
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
