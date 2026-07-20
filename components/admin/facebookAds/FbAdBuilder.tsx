'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useContentBuilder } from '@/hooks/admin/useContentBuilder'
import { useOrgStore, useOrgServices } from '@/store/orgStore'
import { TargetMarketAddEdit, type Audience } from '@/components/admin/targetMarket/TargetMarketAddEdit'
import type { Media } from '@/types/api'

/** Pre-loaded plan item dropdown option (ITEMS → item-title/value = content). */
interface FreeItemOption {
  content: string
}

/**
 * A choosable target market. Fetched audiences supply { id, name }; pixel-derived
 * audiences add a synthetic entry (id -1) carrying a `pixel_id` (Nuxt filteredAudiences).
 */
interface AudienceItem {
  id: number
  name: string
  pixel_id?: string | null
}

/** AI ad-text endpoint response. */
interface AdTextResponse {
  completion: string
}

/** FB_ADS create response. */
interface CreateAdResponse {
  ad?: { id: number }
}

const UNIT_OF_TIME_ITEMS = ['Class', 'Week', 'Month'] as const

const PLURALS_UNIT_OF_TIME: Record<string, string> = {
  Class: 'Classes',
  Week: 'Weeks',
  Month: 'Months',
}

const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'
const FIELD =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66] disabled:bg-gray-100 disabled:text-gray-500'

export function FbAdBuilder() {
  const router = useRouter()
  const { getSecure, postSecure } = useSecureCalls()
  const { baseImageUrl, baseVideoUrl } = useContentBuilder()
  const services = useOrgServices()
  const organization = useOrgStore((s) => s.organization)
  const currencySign = organization?.currency_sign ?? '$'

  // Loading
  const [overlay, setOverlay] = useState(false)
  const [transitionOverlay, setTransitionOverlay] = useState(false)

  // Form state (mirrors Nuxt refs)
  const [serviceId, setServiceId] = useState<number | ''>('')
  const [price, setPrice] = useState<number | ''>('')
  const [discountedPrice, setDiscountedPrice] = useState<number | ''>('')
  const [amountOfUnits, setAmountOfUnits] = useState<number | ''>('')
  const [unitOfTime, setUnitOfTime] = useState<string>('')
  const [freeItems, setFreeItems] = useState<string[]>([])
  const [freeItemText, setFreeItemText] = useState('')

  // Pre-loaded item builder
  const [freeItemName, setFreeItemName] = useState<string>('')
  const [freeItemPrice, setFreeItemPrice] = useState<number | ''>('')
  const [freeItemNameOptions, setFreeItemNameOptions] = useState<FreeItemOption[]>([])

  // Target market
  const [audiences, setAudiences] = useState<AudienceItem[]>([])
  const [audienceId, setAudienceId] = useState<number | ''>('')

  // Budget
  const [leadCount, setLeadCount] = useState<number | ''>(0)
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0)

  // Create-custom-market dialog
  const [dialog, setDialog] = useState(false)

  const service = services.find((s) => s.id === serviceId) ?? null

  // Top-level services only (Nuxt filteredServices).
  const filteredServices = services.filter((s) => !s.parent_service)

  // Prepend pixel-derived custom audiences when the org has pixels (Nuxt filteredAudiences).
  const filteredAudiences: AudienceItem[] = (() => {
    const pixels = organization?.pixel
    if (pixels && pixels.length) {
      const pixelAudiences: AudienceItem[] = pixels.map((p, i) => ({
        name: `Custom audience ${i + 1} Pixel (${p})`,
        id: -1,
        pixel_id: p,
      }))
      return [...pixelAudiences, ...audiences]
    }
    return audiences
  })()

  const selectedAudience =
    audienceId === '' ? null : filteredAudiences.find((a) => a.id === audienceId) ?? null

  useEffect(() => {
    void (async () => {
      try {
        const items = await getSecure<FreeItemOption[]>(SECURE_ENDPOINTS.ITEMS)
        setFreeItemNameOptions(Array.isArray(items) ? items : [])
      } catch (error) {
        console.error(error)
      }
    })()
  }, [getSecure])

  function getMediaSrc(itemObj: Media | null | undefined): string {
    if (!itemObj?.uuid) return ''
    if (itemObj.extension === 'mp4' || itemObj.media_type === 'video') {
      return `${baseVideoUrl}${itemObj.uuid}_1000.${itemObj.extension}`
    }
    return `${baseImageUrl}${itemObj.uuid}_1000.${itemObj.extension}`
  }

  async function getTargetAudience(nextServiceId?: number) {
    const id = nextServiceId ?? (serviceId === '' ? null : serviceId)
    if (!id) return
    try {
      setDialog(false)
      setOverlay(true)
      const res = await getSecure<AudienceItem[]>(SECURE_ENDPOINTS.TARGET_AUDIENCE, {
        service_id: id,
      })
      setAudiences(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error(error)
    } finally {
      setOverlay(false)
    }
  }

  function onServiceChange(value: string) {
    const id = value === '' ? '' : Number(value)
    setServiceId(id)
    setAudienceId('')
    setAudiences([])
    if (id !== '') void getTargetAudience(id)
  }

  // TargetMarketAddEdit onSaved (Nuxt updateAuddience → getTargetAudience refetch).
  function handleAudience(_audience?: Audience) {
    setDialog(false)
    void getTargetAudience()
  }

  function addFreeItems() {
    if (freeItemName && freeItemPrice !== '') {
      const itemText =
        Number(freeItemPrice) === 999
          ? `${freeItemName} (priceless)`
          : `${freeItemName} (${currencySign}${freeItemPrice} value)`
      setFreeItems((prev) => (prev.includes(itemText) ? prev : [...prev, itemText]))
      setFreeItemName('')
      setFreeItemPrice('')
    }
  }

  function addFreeItemChip() {
    const text = freeItemText.trim()
    if (!text) return
    setFreeItems((prev) => (prev.includes(text) ? prev : [...prev, text]))
    setFreeItemText('')
  }

  function removeFreeItem(item: string) {
    setFreeItems((prev) => prev.filter((i) => i !== item))
  }

  function onLeadCountChange(value: string) {
    const n = value === '' ? '' : Number(value)
    setLeadCount(n)
    setMonthlyBudget(n === '' ? 0 : n * 15)
  }

  async function getAIGeneratedAdText(textFor: string): Promise<string | null> {
    try {
      const res = await postSecure<AdTextResponse>(SECURE_ENDPOINTS.AD_TEXT, {
        text_for: textFor,
      })
      return res.completion
    } catch {
      return null
    }
  }

  function validate(): boolean {
    if (serviceId === '') return false
    if (price === '') return false
    if (discountedPrice === '') return false
    if (Number(discountedPrice) > Number(price)) return false
    if (amountOfUnits === '') return false
    if (!unitOfTime) return false
    if (!selectedAudience) return false
    if (leadCount === '') return false
    return true
  }

  async function generateAd() {
    if (!validate()) {
      toast.error('Please fill out the required fields', { duration: 5000 })
      return
    }
    if (!service || !selectedAudience) return
    try {
      setTransitionOverlay(true)
      const titleCalls = [1, 2].map(() => getAIGeneratedAdText('titles'))
      const bodyCalls = [1, 2, 3].map(() => getAIGeneratedAdText('primary_texts'))
      const descCalls = [1, 2].map(() => getAIGeneratedAdText('contents'))
      const aiResults = await Promise.all([...titleCalls, ...bodyCalls, ...descCalls])

      const titles = aiResults.slice(0, 2)
      const bodies = aiResults.slice(2, 5)
      const descriptions = aiResults.slice(5, 7)

      const plural =
        Number(amountOfUnits) > 1 ? PLURALS_UNIT_OF_TIME[unitOfTime] ?? unitOfTime : unitOfTime
      const newTitle = `Get ${amountOfUnits} ${plural} in $${discountedPrice}`
      const finalTitles: (string | null)[] = [newTitle, ...titles]

      const createObj = {
        service_id: service.id,
        audience_id: selectedAudience.id,
        pixel_id: selectedAudience.pixel_id ?? null,
        titles: finalTitles,
        bodies,
        descriptions,
        call_to_action_type: 'SIGN_UP',
        media_is_video: false,
        path_url: service.large_media ? getMediaSrc(service.large_media) : '',
        monthly_budget: monthlyBudget,
        ad_type: 'Basic Ad',
      }
      const response = await postSecure<CreateAdResponse>(SECURE_ENDPOINTS.FB_ADS, createObj)

      toast.success('Facebook Ads created Successfully', { duration: 3000 })

      const createPlanObject = {
        name: `${service.name}'s plan for fb ad`,
        price,
        discounted_price: discountedPrice,
        amount_of_units: amountOfUnits,
        unit_of_time: unitOfTime,
        free_items: freeItems,
        plan_services: [service.id],
        is_trial: false,
        is_primary: true,
      }
      await postSecure(SECURE_ENDPOINTS.PLAN, createPlanObject)

      toast.success('Plan created successfully', { duration: 15000 })
      setTransitionOverlay(false)
      router.push(`/admin/facebook-preview/${response?.ad?.id}`)
    } catch (err) {
      console.error(err)
      setTransitionOverlay(false)
      setOverlay(false)
    }
  }

  return (
    <div className="relative">
      {overlay && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#1565C0] border-t-transparent" />
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Build Your Custom Ad</h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the fields below to generate your own custom ads.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {/* Service (full width) */}
          <div>
            <label className={LABEL}>
              Service <span className="text-red-500">*</span>
            </label>
            <select
              className={FIELD}
              value={serviceId}
              onChange={(e) => onServiceChange(e.target.value)}
            >
              <option value="">Select service</option>
              {filteredServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Price */}
            <div>
              <label className={LABEL}>
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={FIELD}
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            {/* Discounted Price */}
            <div>
              <label className={LABEL}>
                Discounted Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={FIELD}
                value={discountedPrice}
                onChange={(e) =>
                  setDiscountedPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </div>

            {/* Amount of units */}
            <div>
              <label className={LABEL}>
                Amount of units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={FIELD}
                value={amountOfUnits}
                onChange={(e) =>
                  setAmountOfUnits(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </div>

            {/* Unit of time */}
            <div>
              <label className={LABEL}>
                Unit of time <span className="text-red-500">*</span>
              </label>
              <select
                className={FIELD}
                value={unitOfTime}
                onChange={(e) => setUnitOfTime(e.target.value)}
              >
                <option value="">Select unit of time</option>
                {UNIT_OF_TIME_ITEMS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Free items (freeform chips) */}
            <div className="md:col-span-2">
              <label className={LABEL}>Free items</label>
              <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1.5">
                {freeItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full bg-[#e6edfd] px-2.5 py-0.5 text-[13px] text-[#2a4d9b]"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeFreeItem(item)}
                      aria-label={`Remove ${item}`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="min-w-[120px] flex-1 border-none text-sm outline-none"
                  placeholder="Type and press Enter"
                  value={freeItemText}
                  onChange={(e) => setFreeItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addFreeItemChip()
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pre-loaded item builder */}
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className={LABEL}>Add Pre-loaded Items</label>
              <select
                className={FIELD}
                value={freeItemName}
                onChange={(e) => setFreeItemName(e.target.value)}
              >
                <option value="">Select item</option>
                {freeItemNameOptions.map((opt) => (
                  <option key={opt.content} value={opt.content}>
                    {opt.content}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Item Value ({currencySign})</label>
              <input
                type="number"
                className={FIELD}
                value={freeItemPrice}
                onChange={(e) =>
                  setFreeItemPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addFreeItems}
                className="inline-flex h-10 w-full items-center justify-center gap-1 rounded bg-green-600 px-4 text-sm font-semibold uppercase text-white hover:bg-green-700 md:w-auto"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>

          {/* Target market */}
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-9">
              <label className={LABEL}>
                Choose target market <span className="text-red-500">*</span>
              </label>
              <select
                className={FIELD}
                value={audienceId}
                disabled={serviceId === ''}
                onChange={(e) => setAudienceId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">Select target market</option>
                {filteredAudiences.map((a, i) => (
                  <option key={`${a.id}-${i}`} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <button
                type="button"
                onClick={() => setDialog(true)}
                className="inline-flex h-10 w-full items-center justify-center gap-1 rounded bg-green-600 px-4 text-sm font-semibold uppercase text-white hover:bg-green-700"
              >
                Create Custom Market
              </button>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL}>
                Number of leads <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={FIELD}
                value={leadCount}
                onChange={(e) => onLeadCountChange(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Monthly budget</label>
              <input type="number" className={FIELD} value={monthlyBudget} disabled />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={generateAd}
            disabled={transitionOverlay}
            className="inline-flex h-10 items-center justify-center rounded bg-[#1565C0] px-6 text-sm font-semibold uppercase text-white hover:bg-[#0d47a1] disabled:opacity-50"
          >
            {transitionOverlay ? 'Generating…' : 'Generate Ad'}
          </button>
        </div>
      </div>

      {/* Create Custom Market dialog (Nuxt persistent v-dialog max-width 800) */}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-[800px] rounded-lg bg-white shadow-xl">
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                onClick={() => setDialog(false)}
                aria-label="Close"
                className="rounded-full border border-red-500 p-1 text-red-500 hover:bg-red-50"
              >
                <X size={18} />
              </button>
            </div>
            <TargetMarketAddEdit fromBuilder onSaved={handleAudience} onCancel={() => setDialog(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
