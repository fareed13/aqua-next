// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { useAuth } from '@/hooks/useAuth'

interface Template {
  id: number
  subject?: string
  body?: string
  type: string
  tags?: string[]
  service_types?: string[]
}

interface DeleteWarningProps {
  popup: boolean
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function DeleteWarning({ popup, onConfirm, onCancel, loading }: DeleteWarningProps) {
  if (!popup) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this template?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 border border-gray-300 rounded text-sm">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-60">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CommunicationTemplatesList() {
  const router = useRouter()
  const { getSecure, deleteSecure, secureEndpoint } = useSecureCalls()
  const { isSuperAdminLoggedIn } = useAuth()

  const [loading, setLoading] = useState(false)
  const [deletePopup, setDeletePopup] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const itemsPerPageOptions = [5, 10, 15, 20]

  const isSuperAdmin = isSuperAdminLoggedIn()

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      setLoading(true)
      const data = await getSecure(secureEndpoint.COMMUNICATION_TEMPLATES)
      setTemplates(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase()
    if (!term) return templates
    return templates.filter((item) =>
      (item.subject ?? '').toLowerCase().includes(term) ||
      (item.body ?? '').toLowerCase().includes(term) ||
      (item.type ?? '').toLowerCase().includes(term) ||
      (item.tags ?? []).join(',').toLowerCase().includes(term) ||
      (item.service_types ?? []).join(',').toLowerCase().includes(term)
    )
  }, [templates, search])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  const paginationRange = useMemo(() => {
    const start = (page - 1) * itemsPerPage + 1
    const end = Math.min(start + itemsPerPage - 1, filteredItems.length)
    return `${start}-${end} of ${filteredItems.length}`
  }, [filteredItems.length, page, itemsPerPage])

  const pagedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filteredItems.slice(start, start + itemsPerPage)
  }, [filteredItems, page, itemsPerPage])

  function toggleDeletePopup(item?: Template) {
    setDeleteId(item?.id ?? null)
    setDeletePopup(!!item)
  }

  async function deleteTemplate() {
    if (!deleteId) return
    try {
      setLoading(true)
      await deleteSecure(secureEndpoint.COMMUNICATION_TEMPLATES, deleteId, {}, 'Could not delete')
      setTemplates((prev) => prev.filter((t) => t.id !== deleteId))
      setDeleteId(null)
      setDeletePopup(false)
    } catch {
      setDeletePopup(false)
    } finally {
      setLoading(false)
    }
  }

  const headers = ['Subject', 'Body', 'Type', 'Tags', 'Service Types', 'Actions']

  return (
    <div className="min-h-screen bg-gray-50">
      <DeleteWarning popup={deletePopup} onConfirm={deleteTemplate} onCancel={() => toggleDeletePopup()} loading={loading} />

      {/* Header */}
      <div className="bg-[#124e66] p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center">
            <span className="text-white text-3xl mr-3">📚</span>
            <div>
              <h1 className="text-xl text-white font-semibold mb-1">Communication Templates</h1>
              <p className="text-sm text-white/70">Manage communication templates</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
            <div className="relative min-w-[300px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search templates..."
                className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 bg-white text-sm focus:outline-none"
              />
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => router.push('/admin/communication-templates/new')}
                className="bg-white text-gray-800 font-medium px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-100 transition-colors text-sm"
              >
                <span>➕</span> Add Template
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : (
            <table className="w-full bg-white border border-gray-200 rounded shadow-sm text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 border-b">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="text-center text-gray-500 py-10">No Templates Found</td>
                  </tr>
                ) : (
                  pagedItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{item.subject}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="line-clamp-2" dangerouslySetInnerHTML={{ __html: item.body ?? '' }} />
                      </td>
                      <td className="px-4 py-3">{item.type}</td>
                      <td className="px-4 py-3">
                        {item.tags?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, i) => (
                              <span key={i} className="bg-[#fb0062] text-white text-xs px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        ) : '---'}
                      </td>
                      <td className="px-4 py-3">
                        {item.service_types?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {item.service_types.map((st, i) => (
                              <span key={i} className="bg-[#fb0062] text-white text-xs px-2 py-0.5 rounded-full">{st}</span>
                            ))}
                          </div>
                        ) : '---'}
                      </td>
                      <td className="px-4 py-3">
                        {isSuperAdmin && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => router.push(`/admin/communication-templates/${item.id}`)}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >✏️</button>
                            <button
                              onClick={() => toggleDeletePopup(item)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            >🗑️</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {pagedItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded border border-dashed border-gray-300">
              <p className="text-lg font-semibold text-gray-500 mb-2">No Templates Found</p>
              <p className="text-sm text-gray-400 mb-4">Start by adding your first communication template.</p>
              {isSuperAdmin && (
                <button
                  onClick={() => router.push('/admin/communication-templates/new')}
                  className="bg-[#124e66] text-white px-4 py-2 rounded text-sm"
                >
                  ➕ Add First Template
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {pagedItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">📋</span>
                    <span className="font-medium text-gray-800 truncate">{item.subject || 'No Subject'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🏷️</span>
                    <span className="text-sm text-gray-600">{item.type}</span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-sm">🔖</span>
                    {item.tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="bg-[#fb0062] text-white text-xs px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    ) : <span className="text-xs text-gray-400 italic">---</span>}
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-sm">⚙️</span>
                    {item.service_types?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {item.service_types.map((st, i) => (
                          <span key={i} className="bg-[#fb0062] text-white text-xs px-2 py-0.5 rounded-full">{st}</span>
                        ))}
                      </div>
                    ) : <span className="text-xs text-gray-400 italic">---</span>}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-3 mb-3" dangerouslySetInnerHTML={{ __html: item.body || 'No content' }} />
                  {isSuperAdmin && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/communication-templates/${item.id}`)}
                        className="p-1 text-teal-600 hover:text-teal-800"
                      >✏️</button>
                      <button
                        onClick={() => toggleDeletePopup(item)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredItems.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1) }}
                className="border border-gray-300 rounded px-2 py-1"
              >
                {itemsPerPageOptions.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{paginationRange}</span>
              <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 disabled:opacity-40">⏮</button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 disabled:opacity-40">‹</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 disabled:opacity-40">›</button>
              <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-2 py-1 disabled:opacity-40">⏭</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
