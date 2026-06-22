'use client'

import { useState, useEffect, useRef } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const CLASS_TYPES = [
  { label: 'Virtual', value: 'virtual' },
  { label: 'In Person', value: 'in-person' },
  { label: 'Both', value: 'both' },
]

interface UploadedSchedule {
  name: string
  service_name: string
  service_id: number | null
  day_of_week: string
  start_time: string
  end_time: string
  class_type: string
  capacity: number | null
  eligible_for_trial_class: boolean
  link: string
  location_id: number
}

interface VirtualScheduleUploadPopupProps {
  popup: boolean
  toggleUploadPopup: () => void
  selectedLocationId: number
}

function isComplete(s: UploadedSchedule) {
  return !!s.service_id && !!s.name && !!s.day_of_week && !!s.start_time && !!s.end_time
}

export function VirtualScheduleUploadPopup({ popup, toggleUploadPopup, selectedLocationId }: VirtualScheduleUploadPopupProps) {
  const services = useOrgStore(s => s.organization?.services ?? [])
  const { postSecure } = useSecureCalls()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showUploadForm, setShowUploadForm] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedSchedules, setUploadedSchedules] = useState<UploadedSchedule[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  useEffect(() => {
    if (popup) reset()
  }, [popup])

  const reset = () => {
    setShowUploadForm(true)
    setSelectedFile(null)
    setUploadedSchedules([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['application/pdf', 'image/png'].includes(file.type)) return
    setSelectedFile(file)
  }

  const processFile = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('location_id', String(selectedLocationId))

      const token = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(c => c.startsWith('auth._token.local='))?.split('=')[1]
        : null

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${SECURE_ENDPOINTS.SCHEDULE_UPLOAD}`, {
        method: 'POST',
        headers: token ? { Authorization: token } : {},
        body: formData,
      })
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        setUploadedSchedules(data.map((s: any) => {
          const match = (services ?? []).find((sv: any) =>
            sv.name.toLowerCase() === (s.service_name || s.service || '').toLowerCase()
          )
          return {
            name: s.name || s.schedule_name || s.class_name || '',
            service_name: s.service_name || s.service || '',
            service_id: match ? match.id : null,
            day_of_week: s.day_of_week || s.day || '',
            start_time: s.start_time || s.start || '',
            end_time: s.end_time || s.end || '',
            class_type: s.class_type || s.type || 'in-person',
            capacity: s.capacity || null,
            eligible_for_trial_class: s.eligible_for_trial_class ?? true,
            link: s.link || s.virtual_link || '',
            location_id: selectedLocationId,
          }
        }))
        setShowUploadForm(false)
      }
    } catch { /* handled */ }
    finally { setIsUploading(false) }
  }

  const updateSchedule = (index: number, patch: Partial<UploadedSchedule>) => {
    setUploadedSchedules(prev => prev.map((s, i) => {
      if (i !== index) return s
      const updated = { ...s, ...patch }
      if (patch.service_id) {
        const svc = (services ?? []).find((sv: any) => sv.id === patch.service_id)
        if (svc) updated.service_name = (svc as any).name
      }
      return updated
    }))
  }

  const saveSchedules = async () => {
    setLoading(true)
    try {
      await postSecure(SECURE_ENDPOINTS.SCHEDULE_BULK_CREATE, uploadedSchedules)
      toggleUploadPopup()
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  if (!popup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {showUploadForm ? 'Upload Schedules' : 'Uploaded Schedules'}
          </h2>
          <button onClick={toggleUploadPopup} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {showUploadForm ? (
            /* Upload form */
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">📄</div>
              <h3 className="text-lg font-semibold">Upload Schedule File</h3>
              <p className="text-gray-500 text-sm">Supported formats: PDF, PNG</p>

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 animate-pulse">Processing file with AI...</p>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                >
                  Choose File
                </button>
              )}

              <input ref={fileInputRef} type="file" accept=".pdf,image/png" className="hidden" onChange={onFileSelected} />

              {selectedFile && !isUploading && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                    ✓ {selectedFile.name}
                  </div>
                  <div className="flex justify-center gap-3">
                    <button onClick={processFile}
                      className="bg-green-600 text-white px-5 py-2 rounded font-semibold flex items-center gap-2">
                      ▶ Process File
                    </button>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 font-semibold">
                      🤖 AI Powered
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : uploadedSchedules.length > 0 ? (
            /* Review schedules */
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                Please review and edit the uploaded schedules before saving.
              </div>

              {uploadedSchedules.map((schedule, i) => (
                <div key={i} className="border rounded shadow-sm overflow-hidden">
                  <div className="bg-gray-600 text-white px-4 py-2 flex justify-between items-center">
                    <span className="font-semibold text-sm">Schedule {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isComplete(schedule) ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                        {isComplete(schedule) ? 'Ready' : 'Required Fields Missing'}
                      </span>
                      <button onClick={() => setDeleteIndex(i)} className="text-red-300 hover:text-red-100 text-lg">🗑</button>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Name *</label>
                      <input type="text" className="w-full border rounded px-2 py-1 text-sm"
                        value={schedule.name} onChange={e => updateSchedule(i, { name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Service *</label>
                      <select className="w-full border rounded px-2 py-1 text-sm"
                        value={schedule.service_id ?? ''}
                        onChange={e => updateSchedule(i, { service_id: Number(e.target.value) || null })}>
                        <option value="">Select service</option>
                        {(services ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Day *</label>
                      <select className="w-full border rounded px-2 py-1 text-sm"
                        value={schedule.day_of_week} onChange={e => updateSchedule(i, { day_of_week: e.target.value })}>
                        <option value="">Select day</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Start *</label>
                        <input type="time" className="w-full border rounded px-2 py-1 text-sm"
                          value={schedule.start_time} onChange={e => updateSchedule(i, { start_time: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">End *</label>
                        <input type="time" className="w-full border rounded px-2 py-1 text-sm"
                          value={schedule.end_time} onChange={e => updateSchedule(i, { end_time: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Class Type</label>
                      <select className="w-full border rounded px-2 py-1 text-sm"
                        value={schedule.class_type} onChange={e => updateSchedule(i, { class_type: e.target.value })}>
                        {CLASS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Capacity</label>
                      <input type="number" min={0} className="w-full border rounded px-2 py-1 text-sm"
                        value={schedule.capacity ?? ''} onChange={e => updateSchedule(i, { capacity: Number(e.target.value) || null })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Virtual Link</label>
                      <input type="text" className="w-full border rounded px-2 py-1 text-sm"
                        value={schedule.link} onChange={e => updateSchedule(i, { link: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input type="checkbox" checked={schedule.eligible_for_trial_class}
                        onChange={e => updateSchedule(i, { eligible_for_trial_class: e.target.checked })} />
                      <label className="text-xs font-medium">Trial Eligible</label>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={saveSchedules} disabled={loading}
                  className="bg-blue-700 text-white px-5 py-2 rounded font-semibold disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={reset}
                  className="bg-red-600 text-white px-5 py-2 rounded font-semibold">
                  Upload Another File
                </button>
              </div>
            </div>
          ) : (
            /* No schedules found */
            <div className="text-center py-8 space-y-3">
              <div className="text-5xl text-gray-300">📅</div>
              <p className="text-gray-500">No schedules found in the uploaded file</p>
              <button onClick={reset} className="border px-4 py-2 rounded">Try Another File</button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold">Delete Schedule</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete this schedule? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteIndex(null)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => {
                setUploadedSchedules(prev => prev.filter((_, i) => i !== deleteIndex))
                setDeleteIndex(null)
              }} className="px-4 py-2 bg-red-600 text-white rounded font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
