'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
const AUTH_COOKIE = 'auth._token.local'

function getToken(): string | null {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find(c => c.startsWith(`${AUTH_COOKIE}=`))?.split('=')[1] ?? null
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function PdfAdd() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)
  const { getSecure } = useSecureCalls()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [allPdfs, setAllPdfs] = useState<any[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [inMenu, setInMenu] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [nameError, setNameError] = useState('')
  const [fileError, setFileError] = useState(false)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    fetchPdfs()
  }, [])

  const fetchPdfs = async () => {
    try {
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.PDF)
      setAllPdfs(res ?? [])
    } catch { /* handled */ }
  }

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(slugify(value))
    if (allPdfs.find(p => p.name === value)) {
      setNameError('A PDF already exists with this name.')
    } else {
      setNameError('')
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setFileError(true)
      return
    }
    setUploadedFile(file)
    setFileError(false)
  }

  const handleSave = async () => {
    if (!name || !uploadedFile || nameError) {
      if (!uploadedFile) setFileError(true)
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf_url', uploadedFile)
      formData.append('name', name)
      formData.append('slug', slug)
      formData.append('organization', String(organization?.id))
      formData.append('in_menu', String(inMenu))
      const token = getToken()
      const res = await fetch(`${BACKEND_URL}${SECURE_ENDPOINTS.PDF}`, {
        method: 'POST',
        headers: token ? { Authorization: token } : {},
        body: formData,
      })
      if (!res.ok) throw new Error(res.statusText)
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold">Add New PDF</h2>

        <div>
          <h3 className="text-base font-semibold mb-4 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">PDF Name <span className="text-red-500">*</span></label>
              <input type="text" className={`w-full border rounded px-3 py-2 ${nameError ? 'border-red-500' : ''}`}
                value={name} onChange={e => handleNameChange(e.target.value)} placeholder="Enter PDF name" />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PDF URL</label>
              <input type="text" disabled className="w-full border rounded px-3 py-2 bg-gray-100" value={slug} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-4 border-b pb-2">File Upload</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-blue-400 rounded px-4 py-3 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                Choose PDF File
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelected} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={inMenu} onChange={e => setInMenu(e.target.checked)} />
              <span className="text-sm font-medium">Show In Menu</span>
            </label>
          </div>

          <div className="mt-4 p-3 border rounded bg-gray-50 text-sm">
            {uploadedFile ? (
              <span className="text-green-600 font-medium">✓ {uploadedFile.name}</span>
            ) : fileError ? (
              <span className="text-red-500">Please select a PDF file</span>
            ) : (
              <span className="text-gray-400">No file selected</span>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading || !uploadedFile || !!nameError}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Creating...' : 'Create PDF'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
