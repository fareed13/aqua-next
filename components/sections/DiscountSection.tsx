'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function DiscountSection({ headline, subtitle }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const setDialog = useUiStore(s => s.setDialog)

  const monthName = new Date().toLocaleString('en-US', { month: 'long' })

  // Compute discount % from service plans, matching Nuxt store.promoCode logic
  const promoDiscount = (() => {
    const services = organization?.services ?? []
    const allPlans = services.flatMap((s: any) => s.service_plans ?? [])
    const withDiscount = allPlans.filter((sp: any) => sp.plan?.discounted_price)
    if (withDiscount.length > 0) {
      const plan = withDiscount[0].plan
      return ((plan.price - plan.discounted_price) / plan.price) * 100
    }
    return 100
  })()

  return (
    <div className="resigter-discount-section px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row rounded-[10px] overflow-hidden">

          {/* Left: discount percentage (dark bg) */}
          <div
            className="w-full md:w-5/12 bg-black flex items-center justify-center py-[70px]"
            style={{ borderRadius: '10px 0 0 10px' }}
          >
            <div className="text-center">
              <h2
                className="text-white font-extrabold text-center"
                style={{
                  fontSize: 100,
                  lineHeight: '90px',
                  marginBottom: 0,
                  marginLeft: -50,
                  fontWeight: 800,
                }}
              >
                -{promoDiscount.toFixed(0)}%
              </h2>
              <h5
                className="text-center font-medium m-0"
                style={{
                  color: '#d5242c',
                  textShadow: '0px 4px 0px rgba(0,0,0,.15)',
                  fontSize: 34,
                  lineHeight: '47px',
                  fontWeight: 500,
                }}
              >
                From 1 {monthName}
              </h5>
            </div>
          </div>

          {/* Right: details (accent bg) */}
          <div
            className="relative w-full md:w-7/12"
            style={{
              background: '#d5242c',
              paddingTop: 50,
              marginTop: -19,
              borderRadius: '0 10px 10px 0',
            }}
          >
            {/* Diagonal left-edge wedge */}
            <div
              className="hidden md:block absolute"
              style={{
                content: "''",
                left: -90,
                bottom: 0,
                width: 0,
                height: 220,
                borderStyle: 'solid',
                borderWidth: '0px 81px 320px 89px',
                borderColor: 'transparent transparent #d5242c transparent',
              }}
            />

            <div className="px-[43px] md:px-[56px] py-[46px]">
              {headline && (
                <h5 className="text-black font-bold" style={{ fontSize: 24 }}>
                  {headline}
                </h5>
              )}
              {subtitle && (
                <h2 className="text-white font-bold" style={{ fontSize: 36 }}>
                  {subtitle}
                </h2>
              )}
              <button
                onClick={() => setDialog(true)}
                className="flex items-center gap-2 text-white font-bold mt-5 cursor-pointer"
                style={{
                  height: 60,
                  width: 200,
                  background: '#000',
                  justifyContent: 'center',
                }}
                aria-label="Join now"
              >
                Join Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#cccccc">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
