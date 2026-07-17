'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useOrgStore, useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { MultiSelect, MultiCombobox, FIELD_CLASS, LABEL_CLASS } from '@/components/form/Combobox'
import {
  isRequired, whitespaceCheck, negativeValueCheck, maxLimit,
  greaterThanZero, AllowPositiveIntegers, validateField,
} from '@/hooks/useValidation'

interface Props {
  /** Undefined for /admin/plan/new — mirrors Nuxt's `planId !== 'new' ? slug : undefined`. */
  planId?: string
}

interface PreloadedItem { content: string }

interface AdminPlan {
  id: number
  name: string
  price: string
  discounted_price: string | null
  amount_of_units: number | string
  unit_of_time: string
  free_items: string[]
  is_trial: boolean
  services?: Array<number | { service?: number; id?: number }>
}

const UNIT_OF_TIME_ITEMS = ['Class', 'Week', 'Month', 'Day']

/** parseFloat, but NaN (empty/garbage input) becomes null — what Nuxt puts on the wire. */
function toNumberOrNull(v: string): number | null {
  const n = parseFloat(v)
  return Number.isNaN(n) ? null : n
}

/**
 * Add/Edit Plan form — ports Nuxt components/plan/PlanAddEdit.vue.
 *
 * Note the payload key is `plan_services`, not `services`: the backend takes the
 * service ids under that name on write and returns them as `services` on read.
 * `is_default` is deliberately NOT sent — that flag is owned by the Default Plan
 * picker in PlanList, which PATCHes it separately.
 */
export function PlanAddEdit({ planId }: Props) {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const services = useOrgServices()
  const { getSecure, postSecure, putSecure } = useSecureCalls()

  const currencySign = organization?.currency_sign ?? '$'
  const editMode = !!planId

  const [overlay, setOverlay] = useState(false)
  const [id, setId] = useState<number | null>(null)
  const [serviceIds, setServiceIds] = useState<number[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [discountedPrice, setDiscountedPrice] = useState('')
  const [amountOfUnits, setAmountOfUnits] = useState('')
  const [unitOfTime, setUnitOfTime] = useState('')
  const [freeItems, setFreeItems] = useState<string[]>([])
  const [isTrial, setIsTrial] = useState(false)

  const [freeItemName, setFreeItemName] = useState('')
  const [freeItemPrice, setFreeItemPrice] = useState('')
  const [freeItemNameOptions, setFreeItemNameOptions] = useState<PreloadedItem[]>([])

  const [errors, setErrors] = useState<Record<string, string | null>>({})

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const items = await getSecure<PreloadedItem[]>(SECURE_ENDPOINTS.ITEMS)
        if (!cancelled) setFreeItemNameOptions(Array.isArray(items) ? items : [])
      } catch {
        /* Nuxt lets this reject silently */
      }

      if (!planId) return

      try {
        const response = await getSecure<AdminPlan[] | AdminPlan>(SECURE_ENDPOINTS.PLAN, { id: planId })
        const currentPlan = Array.isArray(response) ? response[0] : response
        if (cancelled) return
        if (!currentPlan) { router.push('/admin/plan'); return }

        setId(currentPlan.id)
        // Nuxt tolerates the join arriving as ids or as {service}/{id} objects.
        setServiceIds(
          (currentPlan.services ?? [])
            .map(s => (typeof s === 'object' && s !== null ? s.service ?? s.id ?? null : s))
            .filter((v): v is number => v != null && Boolean(v))
            .map(Number),
        )
        setName(currentPlan.name ?? '')
        setPrice(currentPlan.price != null ? String(currentPlan.price) : '')
        setAmountOfUnits(currentPlan.amount_of_units != null ? String(currentPlan.amount_of_units) : '')
        setUnitOfTime(currentPlan.unit_of_time ?? '')
        setFreeItems(currentPlan.free_items ? [...currentPlan.free_items] : [])
        setIsTrial(!!currentPlan.is_trial)
        setDiscountedPrice(currentPlan.discounted_price != null ? String(currentPlan.discounted_price) : '')
      } catch {
        if (!cancelled) router.push('/admin/plan')
      }
    })()

    return () => { cancelled = true }
  }, [planId, getSecure, router])

  // Nuxt: only top-level programs are selectable.
  const filteredServices = services.filter(s => !s.parent_service)

  /** Nuxt's local rule — discounted price may not exceed price. */
  const priceCheck = (value: unknown) => {
    if (price && parseFloat(String(value)) > parseFloat(price)) {
      return 'Discounted price is greater than Price'
    }
    return true as const
  }

  /** Nuxt validates exactly these five — service_ids is NOT among them. */
  const validateEntries = (): boolean => {
    const next: Record<string, string | null> = {
      name: validateField(name, [isRequired, whitespaceCheck]),
      price: validateField(price, [isRequired, whitespaceCheck, negativeValueCheck, maxLimit]),
      discounted_price: validateField(discountedPrice, [whitespaceCheck, priceCheck, negativeValueCheck]),
      unit_of_time: validateField(unitOfTime, [isRequired, whitespaceCheck]),
      amount_of_units: validateField(amountOfUnits, [isRequired, whitespaceCheck, greaterThanZero, AllowPositiveIntegers]),
    }
    setErrors(next)
    return Object.values(next).every(e => e === null)
  }

  const submit = async () => {
    if (!validateEntries()) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }

    const payload = {
      name,
      price: toNumberOrNull(price),
      discounted_price: toNumberOrNull(discountedPrice),
      amount_of_units: amountOfUnits,
      unit_of_time: unitOfTime,
      free_items: freeItems,
      is_trial: isTrial,
      plan_services: serviceIds,
    }

    setOverlay(true)
    try {
      if (editMode) {
        await putSecure(SECURE_ENDPOINTS.PLAN, { id, ...payload })
        toast.success('PLan Updated successfully', { duration: 15000 })
      } else {
        await postSecure(SECURE_ENDPOINTS.PLAN, payload)
        toast.success('Plan created successfully', { duration: 15000 })
      }
      router.push('/admin/plan')
    } catch {
      /* Nuxt stays on the page and swallows the error */
    } finally {
      setOverlay(false)
    }
  }

  /** Builds the "Free X (…)" label Nuxt composes from the picked item + its value. */
  const addFreeItems = () => {
    const priceError = validateField(freeItemPrice, [whitespaceCheck, greaterThanZero])
    setErrors(prev => ({ ...prev, freeItemPrice: priceError }))
    if (priceError || !freeItemName || !freeItemPrice) return

    // 999 is Nuxt's magic value for "no price shown".
    const itemText = Number(freeItemPrice) === 999
      ? `Free ${freeItemName} (priceless)`
      : `Free ${freeItemName} (${currencySign}${freeItemPrice} value)`

    if (!freeItems.find(i => i === itemText)) setFreeItems(prev => [...prev, itemText])
    setFreeItemName('')
    setFreeItemPrice('')
  }

  const err = (k: string) => errors[k] ? <p className="text-xs text-red-600 mt-1">{errors[k]}</p> : null

  return (
    <div className="px-4 py-10 md:px-10 md:mx-10">
      {overlay && (
        <div className="fixed inset-0 z-[99] bg-white/70 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <h1 className="text-3xl font-bold text-black mb-6">{editMode ? 'Edit Plan' : 'Add Plan'}</h1>

      <div className="space-y-4">
        <MultiSelect
          label="Service"
          options={filteredServices.map(s => ({ value: s.id, label: s.name }))}
          value={serviceIds}
          onChange={setServiceIds}
          chips
        />

        <div>
          <label className={LABEL_CLASS}>Name</label>
          <input className={FIELD_CLASS} value={name} onChange={e => setName(e.target.value)} />
          {err('name')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Price</label>
          <input className={FIELD_CLASS} value={price} onChange={e => setPrice(e.target.value)} />
          {err('price')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Discounted Price</label>
          <input className={FIELD_CLASS} value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} />
          {err('discounted_price')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Amount of units</label>
          <input className={FIELD_CLASS} value={amountOfUnits} onChange={e => setAmountOfUnits(e.target.value)} />
          {err('amount_of_units')}
        </div>

        <div>
          <label className={LABEL_CLASS}>Unit of time</label>
          <select className={FIELD_CLASS} value={unitOfTime} onChange={e => setUnitOfTime(e.target.value)}>
            <option value="">Unit of time</option>
            {UNIT_OF_TIME_ITEMS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          {err('unit_of_time')}
        </div>

        {/* Free-items builder: pick a pre-loaded item + a value, "+ Add Item"
            composes the label and appends it to the Free items combobox. */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-4">
            <MultiCombobox
              label="Free items"
              items={[]}
              value={freeItems}
              onChange={setFreeItems}
              chips
            />
          </div>
          <div className="md:col-span-4">
            <label className={LABEL_CLASS}>Add Pre-loaded Items</label>
            <select className={FIELD_CLASS} value={freeItemName} onChange={e => setFreeItemName(e.target.value)}>
              <option value="">Add Pre-loaded Items</option>
              {freeItemNameOptions.map(i => (
                <option key={i.content} value={i.content}>{i.content}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={LABEL_CLASS}>Item Value ({currencySign})</label>
            <input className={FIELD_CLASS} value={freeItemPrice} onChange={e => setFreeItemPrice(e.target.value)} />
            {err('freeItemPrice')}
          </div>
          <div className="md:col-span-2 flex justify-center items-center md:mt-6">
            <button
              type="button"
              onClick={addFreeItems}
              aria-label="Add free item"
              className="w-full bg-[#124e66] text-white px-4 py-2 rounded font-semibold text-sm uppercase whitespace-nowrap"
            >
              + Add Item
            </button>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <span className="relative inline-block w-9 h-5 shrink-0">
            <input type="checkbox" className="peer sr-only" checked={isTrial} onChange={e => setIsTrial(e.target.checked)} />
            <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-green-600 transition-colors" />
            <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
          </span>
          <span className="text-sm text-gray-800">Is trial?</span>
        </label>

        <div className="pt-2">
          <button
            type="button"
            onClick={submit}
            aria-label={editMode ? 'Update plan' : 'Save plan'}
            className="bg-gray-900 text-white px-6 py-2 rounded font-semibold text-sm uppercase mr-4"
          >
            {editMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
