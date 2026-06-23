'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface PlanAddEditProps {
  planId?: string
}

export function PlanAddEdit({ planId }: PlanAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !planId || planId === 'new'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', price: '', discounted_price: '',
    amount_of_units: '', unit_of_time: 'Month',
    is_trial: false, is_default: false,
  })

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (!isNew) fetchPlan()
  }, [])

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.PLAN, { id: planId })
      const data = Array.isArray(res) ? res[0] : res
      if (data) {
        setForm({
          name: data.name ?? '', price: data.price ?? '',
          discounted_price: data.discounted_price ?? '',
          amount_of_units: data.amount_of_units ?? '',
          unit_of_time: data.unit_of_time ?? 'Month',
          is_trial: data.is_trial ?? false,
          is_default: data.is_default ?? false,
        })
      }
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const updateField = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.PLAN, form)
      } else {
        await putSecure(SECURE_ENDPOINTS.PLAN, { id: Number(planId), ...form })
      }
      router.push('/admin/plan')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">{isNew ? 'Add Plan' : 'Edit Plan'}</h2>
        {['name', 'price', 'discounted_price', 'amount_of_units'].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/_/g, ' ')}</label>
            <input
              type={['price', 'discounted_price', 'amount_of_units'].includes(field) ? 'number' : 'text'}
              className="w-full border rounded px-3 py-2"
              value={(form as any)[field]}
              onChange={e => updateField(field, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Unit of Time</label>
          <select className="w-full border rounded px-3 py-2" value={form.unit_of_time}
            onChange={e => updateField('unit_of_time', e.target.value)}>
            {['Class', 'Day', 'Week', 'Month'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_trial}
              onChange={e => updateField('is_trial', e.target.checked)} />
            <span className="text-sm">Trial Plan</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_default}
              onChange={e => updateField('is_default', e.target.checked)} />
            <span className="text-sm">Default Plan</span>
          </label>
        </div>
        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isNew ? 'Create' : 'Update'}
          </button>
          <button onClick={() => router.push('/admin/plan')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
