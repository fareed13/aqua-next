'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function FreeDiscount({ }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'
  const currencySign = (org as any)?.currency_sign || '$'

  // FreeDiscount requires complex plan/service data from org store
  // Render a simplified discount card using available org data
  const services = (loc as any)?.services ?? []
  const firstService = services.find((s: any) => s.service_plans?.length > 0) ?? null
  const plans = firstService?.service_plans ?? []
  const plan = plans[0] ?? null

  if (!plan) return null

  const price = plan.price ?? 0
  const discountedPrice = plan.discounted_price ?? 0
  const discountPct = discountedPrice
    ? (((price - discountedPrice) / price) * 100).toFixed(0)
    : '100'
  const freeItems: string[] = plan.free_items ?? []
  const serviceName = firstService?.name ?? ''
  const unitOfTime = plan.unit_of_time ?? ''
  const amountOfUnits = plan.amount_of_units ?? ''

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row">
        {/* Left: service image placeholder */}
        <div className="w-full md:w-[30%] bg-gray-200 min-h-[300px]" />

        {/* Right: discount card */}
        <div
          className="w-full md:w-[70%] px-6 md:px-[100px] py-8"
          style={{ backgroundColor: accentColor }}
        >
          <div>
            <strong className="text-white uppercase tracking-wide text-xl">Trial</strong>
            <div className="flex items-start mt-2">
              <span className="relative text-white font-black leading-none mr-8" style={{ fontSize: 136 }}>
                {discountPct}
                <sub className="absolute text-[33px] top-[28%]">%</sub>
              </span>
              <div className="mt-8">
                <h5 className="text-white uppercase leading-[62px] text-[60px] md:text-[90px] mt-1 -ml-2 mb-3">off</h5>
              </div>
            </div>

            {/* Detail */}
            <div className="text-white w-full mt-[-49px] relative">
              <b className="text-[26px] md:text-[29px] uppercase block">{serviceName}</b>
              {amountOfUnits && (
                <div className="bg-[#181a1f] px-4 py-1 text-[18px] md:text-[24px] inline-block mb-5">
                  {amountOfUnits} {unitOfTime} training program
                </div>
              )}
              <h6 className="text-[26px] md:text-[30px] leading-none mb-2">
                {currencySign}{' '}
                {discountedPrice > 0 && <del className="text-black">{price}</del>}
                {' '}{discountedPrice > 0 ? discountedPrice : 0}
              </h6>
              {freeItems.length > 0 && (
                <div className="pt-2 mb-4">
                  {freeItems.map((fi, i) => (
                    <p key={i} className="text-white text-sm leading-6">
                      &#10003; {fi}
                    </p>
                  ))}
                </div>
              )}
              <button
                onClick={() => setDialog(true)}
                className="border border-white text-white px-6 py-2 font-bold"
                aria-label={cta}
              >
                {cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
