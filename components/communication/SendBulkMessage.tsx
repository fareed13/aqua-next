// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useSecureCalls } from '@/hooks/apiCalls/useApiCalls'

interface Customer {
  id: number
  [key: string]: any
}

interface Tag {
  id: string | null
  name: string
}

interface ServiceType {
  id: string | null
  name: string
}

interface Template {
  id: number
  type: 'email' | 'sms'
  subject?: string
  body?: string
  tags?: string[]
  service_types?: string[]
}

interface Props {
  dialogFlag: boolean
  customers: Customer[]
  toggleDialog: (val: boolean | null) => void
  tags: Tag[]
  types: ServiceType[]
}

export default function SendBulkMessage({ dialogFlag, customers, toggleDialog, tags, types }: Props) {
  const { getSecure, postSecure, secureEndpoint } = useSecureCalls()

  const [messageTempType, setMessageTempType] = useState<'custom' | 'template'>('custom')
  const [filterType, setFilterType] = useState<'email' | 'sms' | null>(null)
  const [subject, setSubject] = useState('')
  const [messageEmail, setMessageEmail] = useState('')
  const [messageSms, setMessageSms] = useState('')
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'email' | 'sms'>('sms')
  const [selectedTag, setSelectedTag] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string[]>([])
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    if (!dialogFlag) resetForm()
  }, [dialogFlag])

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      const data = await getSecure(secureEndpoint.COMMUNICATION_TEMPLATES)
      setTemplates(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    }
  }

  function resetForm() {
    setSubject('')
    setMessageEmail('')
    setMessageSms('')
    setMessageTempType('custom')
    setFilterType(null)
    setSelectedTag([])
    setSelectedType([])
  }

  function handleClose() {
    resetForm()
    toggleDialog(false)
  }

  function handleTypeChange(val: 'email' | 'sms') {
    setType(val)
    if (val === 'sms') setSubject('')
  }

  function applyTemplate(template: Template) {
    setType(template.type)
    setSubject(template.subject ?? '')
    if (template.type === 'email') {
      setMessageEmail(template.body ?? '')
      setMessageSms('')
    } else {
      setMessageSms(template.body ?? '')
      setMessageEmail('')
    }
  }

  const filteredTemplates = templates.filter((t) => {
    if (filterType && t.type !== filterType) return false
    if (selectedTag.length && !t.tags?.some((tag) => selectedTag.includes(tag))) return false
    if (selectedType.length && !t.service_types?.some((st) => selectedType.includes(st))) return false
    return true
  })

  async function sendMessage() {
    const currentMessage = type === 'email' ? messageEmail : messageSms
    if (!currentMessage || (type === 'email' && !subject)) {
      alert('Please fill out the required fields')
      return
    }
    try {
      setLoading(true)
      const { message: responseMessage } = await postSecure(
        secureEndpoint.CUSTOMER_SEND_MSG,
        {
          customer_ids: customers,
          type,
          message: currentMessage,
          subject: subject || null,
        },
        {},
        true,
        '',
        false
      )
      alert(responseMessage || 'Message sent successfully')
      resetForm()
      toggleDialog(null)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not send message'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!dialogFlag) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Send Bulk Message</h3>
          <div className="flex items-center gap-3">
            {templates.length > 0 && (
              <select
                value={messageTempType}
                onChange={(e) => setMessageTempType(e.target.value as 'custom' | 'template')}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="custom">Custom</option>
                <option value="template">Template</option>
              </select>
            )}
          </div>
        </div>

        {/* Templates panel */}
        {templates.length > 0 && messageTempType === 'template' && (
          <div className="bg-gray-100 p-4 border-b">
            <div className="flex flex-wrap gap-3 mb-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Templates</h4>
                <p className="text-xs text-gray-500">Double click to apply template</p>
              </div>
              <select
                multiple
                value={selectedTag}
                onChange={(e) => setSelectedTag(Array.from(e.target.selectedOptions, o => o.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {tags.map((t) => <option key={t.id ?? 'all'} value={t.name}>{t.name}</option>)}
              </select>
              <select
                multiple
                value={selectedType}
                onChange={(e) => setSelectedType(Array.from(e.target.selectedOptions, o => o.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {types.map((t) => <option key={t.id ?? 'all'} value={t.name}>{t.name}</option>)}
              </select>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterType(filterType === 'email' ? null : 'email')}
                  className={`px-3 py-1 text-sm rounded border ${filterType === 'email' ? 'bg-[#fb0062] text-white border-[#fb0062]' : 'border-gray-300'}`}
                >📧</button>
                <button
                  onClick={() => setFilterType(filterType === 'sms' ? null : 'sms')}
                  className={`px-3 py-1 text-sm rounded border ${filterType === 'sms' ? 'bg-[#fb0062] text-white border-[#fb0062]' : 'border-gray-300'}`}
                >💬</button>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredTemplates.map((template, n) => (
                <div
                  key={n}
                  onDoubleClick={() => applyTemplate(template)}
                  className="min-w-[200px] h-48 border border-gray-200 rounded bg-white p-3 cursor-pointer hover:shadow-sm flex-shrink-0"
                >
                  <div className="text-center text-2xl mb-2">
                    {template.type === 'email' ? '📧' : '💬'}
                  </div>
                  <hr className="mb-2" />
                  {template.type === 'email' && <p className="text-sm font-semibold mb-1 truncate">{template.subject}</p>}
                  <p className="text-xs text-gray-600 overflow-hidden line-clamp-3" dangerouslySetInnerHTML={{ __html: template.body ?? '' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Type</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as 'email' | 'sms')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          {type === 'email' && (
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          )}

          {type === 'email' ? (
            <div>
              <label className="block text-sm font-medium mb-1">Content (HTML)</label>
              <textarea
                value={messageEmail}
                onChange={(e) => setMessageEmail(e.target.value)}
                rows={6}
                placeholder="Email content..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <textarea
                value={messageSms}
                onChange={(e) => setMessageSms(e.target.value)}
                rows={4}
                placeholder="SMS content..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-5 py-2 bg-[#fb0062] text-white rounded text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2 bg-red-700 text-white rounded text-sm font-medium disabled:opacity-60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
