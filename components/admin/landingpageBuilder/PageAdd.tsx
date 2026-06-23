'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface PageAddProps {
  pageId?: string
}

const PAGE_TYPE_OPTIONS = [{ label: 'Landing Page', value: 'landing_page' }]

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function PageAdd({ pageId }: PageAddProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const location = useOrgStore(s => s.location)
  const { getSecure, postSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [allPages, setAllPages] = useState<any[]>([])
  const [form, setForm] = useState({
    title: '',
    name: '',
    slug: '',
    description: '',
    type: '',
    show_header: false,
    in_menu: false,
    is_member_only: false,
  })
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.PAGE)
      setAllPages(res ?? [])
    } catch { /* handled */ }
  }

  const handleNameChange = (value: string) => {
    const slug = slugify(value)
    setForm(prev => ({ ...prev, name: value, slug }))
    if (allPages.find(p => p.name.toLowerCase() === value.toLowerCase())) {
      setNameError('A page already exists with this name.')
    } else if (value.toLowerCase() === 'contact') {
      setNameError('Contact page is reserved.')
    } else {
      setNameError('')
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.name || !form.type || nameError) return
    setLoading(true)
    try {
      await postSecure(SECURE_ENDPOINTS.PAGE, {
        name: form.name,
        slug: form.slug,
        title: form.title,
        location: location?.id,
        show_header: form.show_header,
        in_menu: form.in_menu,
        type: form.type,
        description: form.description,
        is_member_only: form.is_member_only,
        content: [],
      })
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold">Add New Page</h2>

        <div>
          <h3 className="text-base font-semibold mb-4 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded px-3 py-2"
                value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter page title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Page Name <span className="text-red-500">*</span></label>
              <input type="text" className={`w-full border rounded px-3 py-2 ${nameError ? 'border-red-500' : ''}`}
                value={form.name} onChange={e => handleNameChange(e.target.value)}
                placeholder="Enter page name" />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page URL</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100" disabled value={form.slug} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tag Name</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100" disabled value={form.slug} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={3} className="w-full border rounded px-3 py-2"
              value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter page description" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-4 border-b pb-2">Page Configuration</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Page Type <span className="text-red-500">*</span></label>
            <select className="w-full border rounded px-3 py-2"
              value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>
              <option value="">Select page type</option>
              {PAGE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-6">
            {([
              { label: 'Show Header', field: 'show_header' },
              { label: 'Show In Menu', field: 'in_menu' },
              { label: 'Member Only', field: 'is_member_only' },
            ] as const).map(({ label, field }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[field]}
                  onChange={e => {
                    const checked = e.target.checked
                    setForm(prev => ({
                      ...prev,
                      [field]: checked,
                      ...(field === 'in_menu' && !checked ? { is_member_only: false } : {}),
                    }))
                  }} />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading || !!nameError}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Page'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
