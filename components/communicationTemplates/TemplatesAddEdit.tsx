// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'
import { useOrgStore } from '@/store/orgStore'

interface Tag {
  id: string
  name: string
}

interface ServiceType {
  id: string
  name: string
}

interface Props {
  templateId?: string | null
}

export default function TemplatesAddEdit({ templateId }: Props) {
  const router = useRouter()
  const { getSecure, postSecure, putSecure, secureEndpoint } = useSecureCalls()
  const orgStore = useOrgStore()

  const [overlay, setOverlay] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [type, setType] = useState<'email' | 'sms'>('sms')
  const [editMode, setEditMode] = useState(false)

  const messageTypeOptions = [
    { title: 'Email', key: 'email' },
    { title: 'SMS', key: 'sms' },
  ]

  useEffect(() => {
    initData()
  }, [])

  async function initData() {
    try {
      setOverlay(true)
      if (templateId) {
        setEditMode(true)
        const response = await getSecure(secureEndpoint.COMMUNICATION_TEMPLATES, { id: templateId }, 'error in fetch data')
        const currentTemplate = Array.isArray(response) ? response[0] : response
        setId(currentTemplate.id)
        setType(currentTemplate.type)
        setSubject(currentTemplate.subject ?? '')
        setMessage(currentTemplate.body ?? '')
        setSelectedTags(currentTemplate.tags ?? [])
        setSelectedServiceTypes(currentTemplate.service_types ?? [])
      }
      const fetchedTags = await getSecure(secureEndpoint.TAGS, {}, 'error in fetch data')
      setTags(Array.isArray(fetchedTags) ? fetchedTags : [])

      // Get service types from org store or API
      const orgServiceTypes = (orgStore as any)?.serviceTypes ?? []
      setServiceTypes(orgServiceTypes)
      setOverlay(false)
    } catch (err) {
      console.error(err)
      setOverlay(false)
    }
  }

  function validate(): boolean {
    if (type === 'email' && !subject.trim()) {
      alert('Please fill out the required fields')
      return false
    }
    if (!message.trim()) {
      alert('Please fill out the required fields')
      return false
    }
    return true
  }

  async function create() {
    if (!validate()) return
    try {
      setOverlay(true)
      await postSecure(secureEndpoint.COMMUNICATION_TEMPLATES, {
        subject: type === 'email' ? subject : null,
        body: message,
        type,
        tags: selectedTags,
        service_types: selectedServiceTypes,
      })
      alert('Template created successfully')
      setOverlay(false)
      router.push('/admin/all-settings')
    } catch {
      setOverlay(false)
      router.push('/admin/all-settings')
    }
  }

  async function update() {
    if (!validate()) return
    try {
      setOverlay(true)
      await putSecure(secureEndpoint.COMMUNICATION_TEMPLATES, {
        id,
        subject: type === 'email' ? subject : null,
        body: message,
        type,
        tags: selectedTags,
        service_types: selectedServiceTypes,
      })
      alert('Template Updated successfully')
      setOverlay(false)
      router.push('/admin/all-settings')
    } catch {
      setOverlay(false)
      router.push('/admin/all-settings')
    }
  }

  function toggleSelection(arr: string[], val: string, setter: (a: string[]) => void) {
    if (arr.includes(val)) {
      setter(arr.filter((v) => v !== val))
    } else {
      setter([...arr, val])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      {/* Overlay */}
      {overlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#124e66] to-[#1e6b8a] text-white p-8 rounded-2xl mb-8 text-center shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">📄</span>
            <h1 className="text-3xl font-bold">{editMode ? 'Edit Template' : 'Add New Template'}</h1>
          </div>
          <p className="text-white/90 max-w-lg mx-auto">
            {editMode
              ? 'Update your communication template details and settings'
              : 'Create and configure new communication templates for your organization'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6 space-y-6">
            {/* Type + Subject row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span>📋</span> Select Type
                </label>
                <select
                  value={type}
                  onChange={(e) => { setType(e.target.value as 'email' | 'sms'); if (e.target.value === 'sms') setSubject('') }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {messageTypeOptions.map((o) => (
                    <option key={o.key} value={o.key}>{o.title}</option>
                  ))}
                </select>
              </div>

              {type === 'email' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span>📝</span> Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Template subject..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
                <span className="text-[#124e66] text-lg">✏️</span>
                <span className="font-semibold text-gray-800">Message Content</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={type === 'email' ? 10 : 6}
                placeholder={type === 'email' ? 'Email content (HTML supported)...' : 'Enter your message content here...'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-y font-mono"
              />
            </div>

            {/* Tags + Service Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span>🏷️</span> Select Tags
                </label>
                <div className="border border-gray-300 rounded-lg p-3 flex flex-wrap gap-2 min-h-[80px]">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleSelection(selectedTags, tag.name, setSelectedTags)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedTags.includes(tag.name)
                          ? 'bg-[#fb0062] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && <span className="text-sm text-gray-400">No tags available</span>}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span>⚙️</span> Select Service Types
                </label>
                <div className="border border-gray-300 rounded-lg p-3 flex flex-wrap gap-2 min-h-[80px]">
                  {serviceTypes.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleSelection(selectedServiceTypes, st.name, setSelectedServiceTypes)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedServiceTypes.includes(st.name)
                          ? 'bg-[#fb0062] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                  {serviceTypes.length === 0 && <span className="text-sm text-gray-400">No service types available</span>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center pt-4 border-t border-gray-200">
              {editMode ? (
                <button
                  onClick={update}
                  disabled={overlay}
                  className="min-w-[200px] h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <span>💾</span> Update Template
                </button>
              ) : (
                <button
                  onClick={create}
                  disabled={overlay}
                  className="min-w-[200px] h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <span>💾</span> Save Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
