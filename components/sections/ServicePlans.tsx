'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Check, Copy } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useInterestedServices } from '@/hooks/useInterestedServices'
import { arrangeUnitOfTime } from '@/lib/utils/unitOfTime'
import type { SectionProps } from '@/components/sections/registry'
import type { Service, ServicePlan } from '@/types/api'

interface Props extends SectionProps {
  service?: Service
}

function calculateDiscountPct(price: string, discounted: string | null): number {
  const p = parseFloat(price)
  const d = discounted !== null ? parseFloat(discounted) : null
  if (!p || (d !== null && Math.abs(d) < 0.0001)) return 100
  if (d === null || p === parseFloat(discounted!)) return 0
  return Math.round(((p - d) / p) * 100)
}

export function ServicePlans({ service }: Props) {
  const organization = useOrgStore((s) => s.organization)
  const setDialog = useUiStore((s) => s.setDialog)
  const setSelectedPlan = useUiStore((s) => s.setSelectedPlan)
  const setInterestedServiceId = useUiStore((s) => s.setInterestedServiceId)
  const { setInterestedService } = useInterestedServices()

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#124e66'
  const currencySign = organization?.currency_sign ?? '$'
  const isSalon = organization?.industry_type === 'salon'
  const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''

  const sliderRef = useRef<HTMLDivElement>(null)

  // Collect plans: from passed service prop OR from org services in store
  let plans: ServicePlan[] = []
  if (service) {
    plans = (service.service_plans ?? [])
      .filter((p) => !p.plan.is_upsell && !p.plan.is_gift_card_only)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } else {
    const services = organization?.services ?? []
    const topLevel = services.filter((s) => s.parent_service === null && s.service_plans?.length)
    plans = topLevel
      .flatMap((s) => s.service_plans ?? [])
      .filter((p) => !p.plan.is_upsell && !p.plan.is_gift_card_only)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  if (!plans.length) return null

  const getServiceForPlan = (sp: ServicePlan): Service | undefined => {
    if (service && sp.service === service.id) return service
    return organization?.services?.find((s) => s.id === sp.service)
  }

  const getImageUrl = (sp: ServicePlan): string => {
    const svc = getServiceForPlan(sp)
    if (svc?.large_media?.uuid && svc.large_media.extension) {
      return `${MEDIA_URL}/${svc.large_media.uuid}_700.${svc.large_media.extension}`
    }
    return ''
  }

  const getServiceName = (sp: ServicePlan): string => {
    return getServiceForPlan(sp)?.name ?? ''
  }

  const purchasePlan = (sp: ServicePlan) => {
    setSelectedPlan(sp.plan as unknown as Record<string, unknown>)
    setInterestedService(sp.service)
    setInterestedServiceId(sp.service)
    setDialog(true)
  }

  const copyUrl = (sp: ServicePlan) => {
    const url = `${window.location.protocol}//${window.location.host}/checkout/?service=${sp.service}&plan=${sp.plan_id}`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  const scroll = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return
    sliderRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' })
  }

  return (
    <div className="pb-8">
      {/* Heading */}
      <div className="text-center mb-8 px-4">
        <h2 className="text-xl font-semibold mb-4 block">Available Limited Time Packages</h2>
        <hr className="mx-auto w-[120px] border-2 opacity-100" style={{ borderColor: accentColor }} />
      </div>

      {/* Slider */}
      <div className="relative px-8">
        {plans.length > 1 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white shadow rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white shadow rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >
          {plans.map((sp, i) => {
            const imgUrl = getImageUrl(sp)
            const discountPct = calculateDiscountPct(sp.plan.price, sp.plan.discounted_price)
            const displayPrice = sp.plan.discounted_price ?? sp.plan.price
            const isFree = !sp.plan.price || parseFloat(sp.plan.price) === 0

            return (
              <div
                key={i}
                className="flex-shrink-0 w-[300px] snap-start rounded-lg overflow-hidden shadow-md border border-gray-100 flex flex-col bg-white"
              >
                {/* Image */}
                <div className="relative h-[180px] bg-gray-100">
                  {imgUrl ? (
                    <Image src={imgUrl} alt={sp.plan.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                  {/* Plan name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/40 to-transparent">
                    <p className="text-sm font-semibold text-white drop-shadow">{sp.plan.name}</p>
                  </div>
                  {/* Discount badge */}
                  {discountPct > 0 && discountPct < 100 && (
                    <div
                      className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: accentColor }}
                    >
                      {discountPct}% off
                    </div>
                  )}
                  {/* Copy URL icon */}
                  {discountPct !== 100 && (
                    <button
                      onClick={() => copyUrl(sp)}
                      title="Copy trial URL"
                      className="absolute top-2 left-2 text-white drop-shadow hover:scale-110 transition-transform"
                    >
                      <Copy size={18} />
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="px-4 py-3 flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 mb-1">{getServiceName(sp)}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {sp.plan.amount_of_units}{' '}
                    {arrangeUnitOfTime(sp.plan.amount_of_units, sp.plan.unit_of_time)} training program
                  </p>

                  {/* Free items */}
                  {sp.plan.free_items?.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {sp.plan.free_items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-gray-700">
                          <Check size={14} style={{ color: accentColor }} className="flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price + button */}
                  <div className="mt-auto flex items-center justify-between border-t pt-3">
                    <div>
                      {isFree ? (
                        <span className="text-lg font-bold text-gray-800">Free</span>
                      ) : (
                        <span className="text-lg font-bold" style={{ color: accentColor }}>
                          <sup className="text-xs font-normal text-gray-500 mr-0.5">{currencySign}</sup>
                          {sp.plan.discounted_price && sp.plan.discounted_price !== sp.plan.price && (
                            <del className="text-gray-400 text-sm font-normal mr-1">{sp.plan.price}</del>
                          )}
                          {displayPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => purchasePlan(sp)}
                      className="text-sm font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-80"
                      style={{ color: accentColor }}
                      aria-label={`${isSalon ? 'Book' : 'Enroll'} ${sp.plan.name}`}
                    >
                      {isSalon ? 'Book Now' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
