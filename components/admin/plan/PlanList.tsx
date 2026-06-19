'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

export function PlanList() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)
  const currencySign = organization?.currency_sign ?? '$'
  const { getSecure, deleteSecure } = useSecureCalls()
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.PLAN)
      setPlans(res ?? [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Plans</h2>
        <button onClick={() => router.push('/admin/plan/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">
          + Add Plan
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No plans found</div>
      ) : (
        <div className="bg-white border rounded shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-sm font-semibold">Price</th>
                <th className="px-4 py-3 text-sm font-semibold">Duration</th>
                <th className="px-4 py-3 text-sm font-semibold">Trial</th>
                <th className="px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{plan.name}</td>
                  <td className="px-4 py-3">{currencySign}{plan.discounted_price ?? plan.price}</td>
                  <td className="px-4 py-3">{plan.amount_of_units} {plan.unit_of_time}</td>
                  <td className="px-4 py-3">{plan.is_trial ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/admin/plan/${plan.id}`)}
                      className="text-blue-600 hover:underline text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
