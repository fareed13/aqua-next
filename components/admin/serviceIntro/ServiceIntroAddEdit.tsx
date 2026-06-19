'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface ServiceIntroAddEditProps {
  introId?: string
}

export function ServiceIntroAddEdit({ introId }: ServiceIntroAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const services = useOrgStore(s => s.services)
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !introId
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    init()
  }, [])

  const init = async () => {
    try {
      const types = await getSecure<any[]>(SECURE_ENDPOINTS.SERVICE_TYPE)
      setServiceTypes(types ?? [])
      if (!isNew && introId) {
        setLoading(true)
        const res = await getSecure<any[]>(SECURE_ENDPOINTS.SERVICE_INTRO, { id: parseInt(introId) })
        const intro = Array.isArray(res) ? res[0] : res
        if (intro) {
          setId(intro.id)
          setContent(intro.content ?? '')
          const matched = (types ?? []).filter((st: any) =>
            (intro.service_types ?? []).some((s: any) => s === st.name || s.name === st.name)
          )
          setSelectedServiceTypes(matched)
        }
        setLoading(false)
      }
    } catch { router.push('/admin/all-settings') }
  }

  const toggleType = (type: any) => {
    setSelectedServiceTypes(prev =>
      prev.find(t => t.id === type.id)
        ? prev.filter(t => t.id !== type.id)
        : [...prev, type]
    )
  }

  const handleSave = async () => {
    if (!content) return
    setLoading(true)
    try {
      const payload = { content, intro_types: selectedServiceTypes.map(t => t.id) }
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.SERVICE_INTRO, payload)
      } else {
        await putSecure(SECURE_ENDPOINTS.SERVICE_INTRO, { id, ...payload })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-5">
        <h2 className="text-xl font-bold">{isNew ? 'Add Service Intro' : 'Edit Service Intro'}</h2>

        <div>
          <h3 className="text-base font-semibold mb-3">Content</h3>
          <textarea rows={6} className="w-full border rounded px-3 py-2"
            value={content} onChange={e => setContent(e.target.value)}
            placeholder="Enter the service introduction content..." />
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3">Service Types</h3>
          <div className="flex flex-wrap gap-2">
            {serviceTypes.map((type: any) => (
              <button key={type.id} type="button" onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedServiceTypes.find(t => t.id === type.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}>
                {type.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading || !content}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isNew ? 'Save' : 'Update'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
