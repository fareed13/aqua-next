'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface UserAddEditProps {
  userId?: string
}

export function UserAddEdit({ userId }: UserAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const isNew = !userId
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    if (!isNew && userId) fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.USER, { id: parseInt(userId!) })
      const user = Array.isArray(res) ? res[0] : res
      if (user) {
        setId(user.id)
        setForm({ firstName: user.first_name ?? '', lastName: user.last_name ?? '', email: user.email ?? '', password: '' })
      }
    } catch { router.push('/admin/all-settings') }
    finally { setLoading(false) }
  }

  const validate = () => {
    const errs: Partial<typeof form> = {}
    if (!form.firstName) errs.firstName = 'Required'
    if (!form.lastName) errs.lastName = 'Required'
    if (!form.email) errs.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
        organization: organization?.id,
      }
      if (isNew) {
        await postSecure(SECURE_ENDPOINTS.USER, payload)
      } else {
        await putSecure(SECURE_ENDPOINTS.USER, { id, ...payload })
      }
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const Field = ({ label, field, type = 'text' }: { label: string; field: keyof typeof form; type?: string }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label} <span className="text-red-500">*</span></label>
      <input type={type} className={`w-full border rounded px-3 py-2 ${errors[field] ? 'border-red-500' : ''}`}
        value={form[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold">{isNew ? 'Add User' : 'Edit User'}</h2>

        <Field label="First Name" field="firstName" />
        <Field label="Last Name" field="lastName" />
        <Field label="Email" field="email" type="email" />
        <Field label="Password" field="password" type="password" />

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading}
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
