'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface FaqAddEditProps {
  faqId?: string
}

const TOPIC_OPTIONS = ['General', 'Membership', 'Schedule', 'Billing', 'Classes', 'Other']

export function FaqAddEdit({ faqId }: FaqAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const services = useOrgStore(s => s.organization?.services ?? [])
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !faqId
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    question: '',
    answer: '',
    service_id: '' as number | '',
    topics: [] as string[],
  })

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (!isNew && faqId) fetchFaq()
  }, [])

  const fetchFaq = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.FAQ, { id: parseInt(faqId!) })
      const faq = Array.isArray(res) ? res[0] : res
      if (faq) {
        setForm({
          question: faq.question ?? '',
          answer: faq.answer ?? '',
          service_id: faq.service?.id ?? '',
          topics: faq.topics ?? [],
        })
      }
    } catch { router.push('/admin/all-settings') }
    finally { setLoading(false) }
  }

  const toggleTopic = (topic: string) => {
    setForm(prev => {
      if (prev.topics.includes(topic)) {
        return { ...prev, topics: prev.topics.filter(t => t !== topic) }
      }
      if (prev.topics.length >= 2) return prev
      return { ...prev, topics: [...prev.topics, topic] }
    })
  }

  const handleSave = async () => {
    if (!form.question || !form.answer || !form.service_id) return
    setLoading(true)
    try {
      const payload = { question: form.question, answer: form.answer, service: form.service_id, topics: form.topics }
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.FAQ, payload)
      } else {
        await putSecure(SECURE_ENDPOINTS.FAQ, { id: Number(faqId), ...payload })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">{isNew ? 'Add New FAQ' : 'Edit FAQ'}</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Question <span className="text-red-500">*</span></label>
          <input type="text" className="w-full border rounded px-3 py-2"
            value={form.question} onChange={e => setForm(prev => ({ ...prev, question: e.target.value }))}
            placeholder="Enter your frequently asked question" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Answer <span className="text-red-500">*</span></label>
          <textarea rows={6} className="w-full border rounded px-3 py-2"
            value={form.answer} onChange={e => setForm(prev => ({ ...prev, answer: e.target.value }))}
            placeholder="Provide a clear and helpful answer" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Topics <span className="text-gray-400 text-xs">(max 2)</span></label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map(topic => (
              <button key={topic} type="button" onClick={() => toggleTopic(topic)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  form.topics.includes(topic)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}>
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service <span className="text-red-500">*</span></label>
          <select className="w-full border rounded px-3 py-2"
            value={form.service_id} onChange={e => setForm(prev => ({ ...prev, service_id: Number(e.target.value) || '' }))}>
            <option value="">Select a service</option>
            {(services ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isNew ? 'Save FAQ' : 'Update FAQ'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
