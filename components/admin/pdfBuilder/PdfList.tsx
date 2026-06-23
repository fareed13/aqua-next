'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface PdfItem {
  id: number
  name: string
  slug: string
  updated_at?: string
}

export function PdfList() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, deleteSecure } = useSecureCalls()

  const [pdfs, setPdfs] = useState<PdfItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    fetchPdfs()
  }, [])

  const fetchPdfs = async () => {
    try {
      setLoading(true)
      const res = await getSecure<PdfItem[]>(SECURE_ENDPOINTS.PDF)
      setPdfs(res ?? [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setDeleting(true)
      await deleteSecure(SECURE_ENDPOINTS.PDF, deleteId)
      setPdfs(prev => prev.filter(p => p.id !== deleteId))
      setDeleteId(null)
    } catch { /* handled */ }
    finally { setDeleting(false) }
  }

  const filtered = pdfs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div>
      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold mb-2">Delete PDF</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this PDF? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#124e66] px-4 py-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-white text-xl font-bold">PDF List</h1>
          <p className="text-white/70 text-sm">Manage and track PDFs.</p>
        </div>
        <input
          type="text"
          placeholder="Search PDFs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full md:w-64"
        />
        <button
          onClick={() => router.push('/admin/pdf-builder/add')}
          className="bg-white text-[#124e66] font-semibold px-4 py-2 rounded text-sm whitespace-nowrap"
        >
          + Add PDF
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {search ? 'No PDFs match your search.' : 'No PDFs found. Add your first PDF.'}
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">URL</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(pdf => (
                  <tr key={pdf.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{pdf.name}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/pdf/${pdf.slug}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {origin}/pdf/{pdf.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {pdf.updated_at ? new Date(pdf.updated_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteId(pdf.id)} className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y">
            {filtered.map(pdf => (
              <div key={pdf.id} className="p-4 space-y-2">
                <div className="font-semibold">{pdf.name}</div>
                <Link
                  href={`/pdf/${pdf.slug}`}
                  className="text-blue-600 text-sm hover:underline break-all block"
                >
                  {origin}/pdf/{pdf.slug}
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {pdf.updated_at ? new Date(pdf.updated_at).toLocaleDateString() : '—'}
                  </span>
                  <button onClick={() => setDeleteId(pdf.id)} className="text-red-600 text-sm hover:text-red-800">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
