'use client'

import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { X, GripVertical, Check } from 'lucide-react'
import { useOrgStore, useOrgServices } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { arrangeUnitOfTime } from '@/lib/utils/unitOfTime'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Service, ServicePlan } from '@/types/api'

interface Props {
  onClose: () => void
  onSaved: () => void
}

/**
 * "Re-order Plans" dialog — ports Nuxt components/plan/ReorderPlansDialog.vue.
 *
 * Plans are ordered *per service*, not globally: the same plan can sit at a
 * different position under each service, so the order lives on the service_plans
 * join rows and is saved as a bulk [{service_id, plan_id, order}] POST.
 *
 * Drag-and-drop is native HTML5 rather than @hello-pangea/dnd (used by
 * ReorderPrograms): Nuxt's vue-draggable wraps Sortable.js, which reorders
 * correctly in a *wrapping* grid. @hello-pangea/dnd's horizontal mode assumes a
 * single non-wrapping row, and these 280px cards wrap inside the 960px dialog.
 */
export function ReorderPlansDialog({ onClose, onSaved }: Props) {
  const organization = useOrgStore(s => s.organization)
  const storeServices = useOrgServices()
  const { postSecure } = useSecureCalls()

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#d5242c'
  const currencySign = organization?.currency_sign ?? '$'

  // Nuxt snapshots the store onMounted and never refetches; deriving straight
  // from the store is equivalent (it can't change while the dialog is open) and
  // avoids syncing state in an effect.
  const services: Service[] = storeServices

  const servicesWithPlans = useMemo(
    () => services.filter(s => !s.parent_service && s.service_plans?.length > 0),
    [services],
  )

  const plans = useMemo(
    () => servicesWithPlans.flatMap(s => s.service_plans ?? []),
    [servicesWithPlans],
  )

  // Nuxt defaults to the first program.
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    () => servicesWithPlans[0]?.id ?? null,
  )
  const [saving, setSaving] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [pendingServiceId, setPendingServiceId] = useState<number | null>(null)

  /** The saved order straight from the store — the baseline the drag order diverges from. */
  const filteredPlans = useMemo(() => {
    if (!selectedServiceId || !plans.length) return []
    return plans
      .filter(p => Number(p.service) === Number(selectedServiceId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [selectedServiceId, plans])

  // The in-progress drag order, tagged with the service it belongs to. Tagging
  // lets a service switch fall back to `filteredPlans` during render instead of
  // needing an effect to reset the list.
  const [dragOrder, setDragOrder] = useState<{ sid: number | null; list: ServicePlan[] } | null>(null)
  const draggablePlans =
    dragOrder && dragOrder.sid === selectedServiceId ? dragOrder.list : filteredPlans

  const hasUnsavedChanges =
    !!selectedServiceId &&
    draggablePlans.length === filteredPlans.length &&
    draggablePlans.some((p, i) => p.plan_id !== filteredPlans[i]?.plan_id)

  const switchService = (id: number | null) => {
    setSelectedServiceId(id)
    setDragOrder(null)
  }

  const onServiceChange = (id: number | null) => {
    if (hasUnsavedChanges) {
      setPendingServiceId(id)
      setShowDiscardConfirm(true)
      return
    }
    switchService(id)
  }

  const confirmServiceSwitch = () => {
    setShowDiscardConfirm(false)
    switchService(pendingServiceId)
    setPendingServiceId(null)
  }

  const getService = (sid: number) => services.find(x => Number(x.id) === Number(sid))
  const getServiceName = (sid: number) => getService(sid)?.name ?? ''
  const getServiceImage = (sid: number) => {
    const lm = getService(sid)?.large_media
    return lm?.uuid && lm?.extension ? buildMediaUrl(lm, 700) : ''
  }

  /** Nuxt returns 100 for a zero price/discount, 0 when there is no real discount. */
  const calculateDiscountPercentage = (planPrice?: string, discountedPrice?: string | null) => {
    const price = Number(planPrice)
    const disc = discountedPrice == null ? null : Number(discountedPrice)
    const tolerance = 0.0001
    if (Math.abs(price) < tolerance || (disc != null && Math.abs(disc) < tolerance)) return 100
    if (disc == null || price === disc) return 0
    return Number((((price - disc) / price) * 100).toFixed(0))
  }

  // --- native HTML5 drag/drop ---
  const dragIndex = useRef<number | null>(null)
  const onDragStart = (i: number) => { dragIndex.current = i }
  const onDragEnter = (i: number) => {
    const from = dragIndex.current
    if (from == null || from === i) return
    const next = [...draggablePlans]
    const [moved] = next.splice(from, 1)
    next.splice(i, 0, moved)
    setDragOrder({ sid: selectedServiceId, list: next })
    dragIndex.current = i
  }
  const onDragEnd = () => { dragIndex.current = null }

  const saveOrder = async () => {
    if (!selectedServiceId || draggablePlans.length === 0) return
    setSaving(true)
    const bulkData = draggablePlans.map((item, index) => ({
      service_id: Number(selectedServiceId),
      plan_id: item.plan_id,
      order: index + 1,
    }))
    try {
      await postSecure(SECURE_ENDPOINTS.SERVICE_PLAN_BULK_UPDATE, bulkData)
      toast.success('Plans reordered successfully', { duration: 5000 })
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to reorder plans', { duration: 5000 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg w-full max-w-[960px] max-h-[90vh] flex flex-col shadow-xl">
          <div className="flex justify-end px-2 pt-2">
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 text-red-600">
              <X size={24} />
            </button>
          </div>

          <div className="px-6">
            <h2 className="text-2xl font-bold mt-3">Re-order Plans</h2>
            <p className="text-gray-500 mb-0">
              Preview how plans appear on your site. Select a Program and drag to reorder.
            </p>
          </div>
          <div className="border-t border-gray-200 mt-4 mb-4" />

          <div className="px-6 overflow-y-auto flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
              value={selectedServiceId ?? ''}
              onChange={e => onServiceChange(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">Select Service</option>
              {servicesWithPlans.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {selectedServiceId && draggablePlans.length > 0 ? (
              <div className="min-h-[150px]">
                <p className="text-gray-500 mb-2"><strong>Preview:</strong> Drag cards to change order</p>
                <div className="flex flex-wrap gap-4 min-h-[200px]">
                  {draggablePlans.map((element, i) => {
                    const img = getServiceImage(element.service)
                    const pct = calculateDiscountPercentage(element.plan?.price, element.plan?.discounted_price)
                    return (
                      <div
                        key={element.plan_id}
                        draggable
                        onDragStart={() => onDragStart(i)}
                        onDragEnter={() => onDragEnter(i)}
                        onDragOver={e => e.preventDefault()}
                        onDragEnd={onDragEnd}
                        className="w-[280px] min-w-[280px] max-w-[320px] bg-white border border-gray-200 rounded shadow-sm cursor-grab active:cursor-grabbing"
                      >
                        <div className="relative">
                          <div className="absolute top-2 left-2 z-[2] px-2 py-1 bg-black/60 text-white rounded text-xs flex items-center gap-1">
                            <GripVertical size={14} /> Drag
                          </div>
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element -- admin-only preview
                            <img src={img} alt="Service plan image" className="w-full h-full object-cover" />
                          ) : (
                            <div className="min-h-[120px] bg-gray-300 w-full" />
                          )}
                          <h3
                            className="absolute bottom-0 w-full px-4 py-2 text-lg font-medium text-black"
                            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.9), -1px 1px 2px rgba(255,255,255,0.9), 1px -1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9)' }}
                          >
                            {element?.plan?.name || 'Plan'}
                          </h3>
                          {pct !== 100 && (
                            <div
                              className="absolute right-[10px] top-[14px] bg-white rounded-[5px] h-[23px] px-[9px] flex items-center justify-center font-bold text-sm"
                              style={{ color: accentColor }}
                            >
                              {pct}% off
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div>{getServiceName(element.service)}</div>
                          <div className="text-sm text-gray-600">
                            {element.plan?.amount_of_units}{' '}
                            {arrangeUnitOfTime(element.plan?.amount_of_units, element.plan?.unit_of_time)}{' '}
                            training program
                          </div>
                          {element.plan?.free_items && element.plan.free_items.length > 0 && (
                            <div className="mt-3">
                              {element.plan.free_items.map((fitem, x) => (
                                <div key={x} className="flex mb-2.5">
                                  <div className="flex items-center justify-center">
                                    <Check size={25} style={{ color: accentColor, marginRight: 10 }} />
                                    {fitem}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="px-[17px] py-[14px] border-t border-gray-300">
                          {element.plan?.price ? (
                            <h3 className="text-lg font-bold" style={{ color: accentColor }}>
                              <sup className="text-sm mr-[7px] text-[#868686]">{currencySign}</sup>
                              <del className="text-black">{element.plan?.price}</del>{' '}
                              {element.plan?.discounted_price ? element.plan.discounted_price : element.plan?.price}
                            </h3>
                          ) : (
                            <h3 className="text-lg font-bold">Free</h3>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : selectedServiceId && filteredPlans.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No plans for this service</div>
            ) : (
              <div className="py-8 text-center text-gray-500">Select a service to reorder plans</div>
            )}
          </div>

          <div className="border-t border-gray-200" />
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={saveOrder}
              disabled={saving || !selectedServiceId || draggablePlans.length === 0}
              className="bg-[#124e66] text-white px-6 py-2 rounded font-semibold text-sm uppercase disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save order'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm discard unsaved changes */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[440px] shadow-xl">
            <h2 className="text-lg font-semibold p-4">Unsaved changes</h2>
            <div className="px-4 pb-4 pt-0 text-gray-800">
              You have unsaved changes to the plan order. Switch service anyway? Changes will be lost.
            </div>
            <div className="flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                onClick={() => { setShowDiscardConfirm(false); setPendingServiceId(null) }}
                className="px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmServiceSwitch}
                className="px-4 py-2 bg-[#124e66] text-white rounded text-sm font-semibold"
              >
                Switch anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
