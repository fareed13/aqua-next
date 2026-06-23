'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface GoogleAdsAddEditProps {
  adsId?: string
}

interface AdItem {
  headline_part1: string
  headline_part2: string
  headline_part3: string
  description: string
  description2: string
  final_url: string
}

const emptyAd = (): AdItem => ({
  headline_part1: '',
  headline_part2: '',
  headline_part3: '',
  description: '',
  description2: '',
  final_url: '',
})

export function GoogleAdsAddEdit({ adsId }: GoogleAdsAddEditProps) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { postSecure } = useSecureCalls()

  const isNew = !adsId
  const [loading, setLoading] = useState(false)
  const [monthlyBudget, setMonthlyBudget] = useState<number | ''>('')
  const [adsList, setAdsList] = useState<AdItem[]>([emptyAd(), emptyAd()])

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login') }
  }, [])

  const addAd = () => setAdsList(prev => [...prev, emptyAd()])

  const removeAd = (index: number) => {
    if (adsList.length <= 2) return
    setAdsList(prev => prev.filter((_, i) => i !== index))
  }

  const updateAd = (index: number, field: keyof AdItem, value: string) => {
    setAdsList(prev => prev.map((ad, i) => i === index ? { ...ad, [field]: value } : ad))
  }

  const handleSave = async () => {
    if (!monthlyBudget) return
    setLoading(true)
    try {
      await postSecure(SECURE_ENDPOINTS.GOOGLE_ADS, {
        google_ads_data: adsList,
        monthly_budget: monthlyBudget,
      })
      router.push('/admin/all-settings')
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const HEADLINE_MAX = 30
  const DESC_MAX = 90

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border rounded shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{isNew ? 'Create an Ad' : 'Edit Ad'}</h2>
          <button onClick={addAd}
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold text-sm">
            + Ad
          </button>
        </div>

        <div className="max-w-xs">
          <label className="block text-sm font-medium mb-1">Monthly Budget <span className="text-red-500">*</span></label>
          <input type="number" min={0} className="w-full border rounded px-3 py-2"
            value={monthlyBudget} onChange={e => setMonthlyBudget(Number(e.target.value))} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adsList.map((ad, i) => (
            <div key={i} className="border rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Ad {i + 1}</span>
                <button onClick={() => removeAd(i)} disabled={adsList.length <= 2}
                  className="text-red-500 text-sm disabled:opacity-30">Remove</button>
              </div>

              {(['headline_part1', 'headline_part2', 'headline_part3'] as const).map((field, fi) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1">
                    Headline {fi + 1} <span className="text-gray-400">({ad[field].length}/{HEADLINE_MAX})</span>
                  </label>
                  <input type="text" maxLength={HEADLINE_MAX} className="w-full border rounded px-2 py-1 text-sm"
                    value={ad[field]} onChange={e => updateAd(i, field, e.target.value)} />
                </div>
              ))}

              {(['description', 'description2'] as const).map((field, di) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1">
                    Description {di + 1} <span className="text-gray-400">({ad[field].length}/{DESC_MAX})</span>
                  </label>
                  <input type="text" maxLength={DESC_MAX} className="w-full border rounded px-2 py-1 text-sm"
                    value={ad[field]} onChange={e => updateAd(i, field, e.target.value)} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-2">
          <button onClick={handleSave} disabled={loading || !monthlyBudget}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => router.push('/admin/all-settings')}
            className="bg-gray-500 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  )
}
