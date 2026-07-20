'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { ApiError } from '@/lib/api/httpClient'

interface GoogleAdsAddEditProps {
  adsId?: string
  /** When embedded in the list (accordion) these drive the inline toggle. */
  onClose?: () => void
  onSaved?: () => void
}

interface AdItem {
  final_url: string | null
  headline_part1: string
  headline_part2: string
  headline_part3: string
  description: string
  description2: string
}

const HEADLINE_MAX = 30
const DESC_MAX = 90

const LOADING_TEXT = ['Getting Targeting ready', 'Creating ad campaigns', 'Publishing the ads']

const emptyAd = (): AdItem => ({
  final_url: null,
  headline_part1: '',
  headline_part2: '',
  headline_part3: '',
  description: '',
  description2: '',
})

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const data = err.data
    if (data && typeof data === 'object' && 'messages' in data) {
      const m = (data as { messages: unknown }).messages
      if (typeof m === 'string') return m
    }
    if (typeof data === 'string' && data) return data
  }
  return 'Something went wrong'
}

export function GoogleAdsAddEdit({ adsId, onClose, onSaved }: GoogleAdsAddEditProps) {
  const router = useRouter()
  const { postSecure } = useSecureCalls()

  const editMode = !!adsId
  const [overlay, setOverlay] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [monthlyBudget, setMonthlyBudget] = useState<number | ''>('')
  const [adsList, setAdsList] = useState<AdItem[]>([emptyAd(), emptyAd()])

  // Rotating loader text (Nuxt TextTransitionLoader) while publishing.
  useEffect(() => {
    if (!overlay) return
    const id = setInterval(() => setLoadingIndex((i) => (i + 1) % LOADING_TEXT.length), 1500)
    return () => clearInterval(id)
  }, [overlay])

  const addAd = () => setAdsList((prev) => [...prev, emptyAd()])

  const removeAd = (index: number) => {
    if (adsList.length <= 2) {
      toast.error('Minimum 2 ads are required.', { duration: 2000 })
      return
    }
    toast.error('ad removed', { duration: 2000 })
    setAdsList((prev) => prev.filter((_, i) => i !== index))
  }

  const updateAd = (index: number, field: keyof AdItem, value: string) => {
    setAdsList((prev) => prev.map((ad, i) => (i === index ? { ...ad, [field]: value } : ad)))
  }

  const goBack = () => {
    if (onClose) onClose()
    else router.push('/admin/all-settings')
  }

  const isValid = () => {
    if (!monthlyBudget || Number(monthlyBudget) <= 0) return false
    return adsList.every(
      (ad) =>
        ad.headline_part1.trim() &&
        ad.headline_part2.trim() &&
        ad.headline_part3.trim() &&
        ad.description.trim() &&
        ad.description2.trim(),
    )
  }

  const create = async () => {
    if (!isValid()) {
      toast.error('Please fill out all required fields.', { duration: 5000 })
      return
    }
    try {
      setOverlay(true)
      await postSecure(SECURE_ENDPOINTS.GOOGLE_ADS, {
        service_id: null,
        google_ads_data: adsList,
        monthly_budget: monthlyBudget,
      })
      toast.success('Google Ads created Successfully', { duration: 3000 })
      setOverlay(false)
      if (onSaved) onSaved()
      else router.push('/admin/all-settings')
    } catch (err) {
      toast.error(errorMessage(err), { duration: 5000 })
      setOverlay(false)
    }
  }

  const FIELD =
    'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3 py-2 text-sm focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8">
      {overlay && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-4 bg-white/80">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#1565C0] border-t-transparent" />
          <p className="text-base font-medium text-[#124e66]">{LOADING_TEXT[loadingIndex]}</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">{editMode ? 'Edit Ad' : 'Create an Ad'}</h1>
      </div>

      {/* Monthly budget */}
      <div className="mb-6 max-w-md">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Monthly budget <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={0}
          className={FIELD}
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>

      {/* Add ad */}
      <div className="mb-6 flex justify-center">
        <button
          type="button"
          onClick={addAd}
          id="create-item"
          className="inline-flex items-center gap-1 rounded bg-green-600 px-6 py-2.5 text-sm font-semibold uppercase text-white hover:bg-green-700"
        >
          <Plus size={18} /> Ad
        </button>
      </div>

      {/* Ad cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {adsList.map((ad, i) => (
          <div key={i} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Ad {i + 1}</span>
              <button
                type="button"
                onClick={() => removeAd(i)}
                className="text-sm font-medium uppercase text-orange-500 hover:text-orange-600"
              >
                Remove
              </button>
            </div>

            {([
              ['headline_part1', 'Headline 1', HEADLINE_MAX],
              ['headline_part2', 'Headline 2', HEADLINE_MAX],
              ['headline_part3', 'Headline 3', HEADLINE_MAX],
              ['description', 'Description', DESC_MAX],
              ['description2', 'Description 2', DESC_MAX],
            ] as const).map(([field, label, max]) => (
              <div key={field} className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  {label} <span className="text-red-500">*</span>{' '}
                  <span className="text-gray-400">
                    ({ad[field]?.length ?? 0}/{max})
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={max}
                  className={FIELD}
                  value={ad[field] ?? ''}
                  onChange={(e) => updateAd(i, field, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={create}
          disabled={overlay || !monthlyBudget}
          className="h-10 rounded bg-[#1565C0] px-6 text-sm font-semibold uppercase text-white hover:bg-[#0d4a94] disabled:opacity-50"
        >
          {overlay ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={goBack}
          className="h-10 rounded bg-gray-200 px-6 text-sm font-semibold uppercase text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
