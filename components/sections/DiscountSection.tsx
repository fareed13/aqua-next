'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function DiscountSection({ headline, subtitle }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'

  // Get current month name
  const monthName = new Date().toLocaleString('en-US', { month: 'long' })

  // Try to get promo code discount from location
  const promoDiscount = (loc as any)?.promo_code?.discount ?? 0

  return (
    <div className="px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row rounded-[10px] overflow-hidden">
          {/* Left: discount percentage */}
          <div className="w-full md:w-5/12 bg-black rounded-tl-[10px] rounded-bl-[10px] flex items-center justify-center py-[70px]">
            <div className="text-center">
              <h2 className="text-white font-extrabold text-[80px] md:text-[100px] leading-[90px] mb-0 text-center -ml-12">
                -{promoDiscount.toFixed(0)}%
              </h2>
              <h5 className="text-[#d5242c] text-center text-[28px] md:text-[34px] font-medium m-0">
                From 1 {monthName}
              </h5>
            </div>
          </div>

          {/* Right: details */}
          <div
            className="relative w-full md:w-7/12 bg-[#d5242c] rounded-tr-[10px] rounded-br-[10px] pt-[50px] -mt-5 md:mt-0"
          >
            <div className="px-8 md:px-14 py-12">
              {headline && (
                <h5 className="text-black text-[24px] font-bold">{headline}</h5>
              )}
              {subtitle && (
                <h2 className="text-white text-[26px] md:text-[36px] font-bold">{subtitle}</h2>
              )}
              <button
                onClick={() => setDialog(true)}
                className="mt-5 h-[60px] w-[200px] bg-black text-white font-bold flex items-center justify-center gap-2"
                aria-label="Join now"
              >
                Join Now
                <span>&#8594;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
