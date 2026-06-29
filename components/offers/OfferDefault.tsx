'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useOffers } from '@/hooks/useOffers'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { useInterestedServices } from '@/hooks/useInterestedServices'

const CheckCircleIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 text-white">
    <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.59,7.58L10,14.17L7.41,11.59L6,13L10,17L18,9L16.59,7.58Z" />
  </svg>
)

export function OfferDefault({ plan }: SectionProps) {
  const accentColor = useOrgStore(s => s.organization?.colors?.['app-main-accent-color']) ?? '#d5242c'
  const accentDark = useOrgStore(s => s.organization?.colors?.['app-main-accent-dark']) ?? '#9e0007'
  const setSelectedPlan = useUiStore(s => s.setSelectedPlan)
  const { isLoggedIn } = useAuth()
  const { setInterestedService } = useInterestedServices()

  const {
    offerReady,
    showComponent,
    classOffer,
    whatYouGet,
    offers,
    getComponentPlan,
    setDialog,
  } = useOffers({ component_plan_id: plan ?? null })

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })

  const handleCta = () => {
    if (isLoggedIn()) return
    setDialog(true)
    const componentPlan = getComponentPlan(plan ?? null)
    if (componentPlan) {
      setSelectedPlan(componentPlan.plan as Record<string, unknown>)
      if (componentPlan.service) setInterestedService(componentPlan.service)
    }
  }

  if (!showComponent) return null

  return (
    <section
      className="relative z-[3] py-9 px-0 overflow-hidden"
      style={{ backgroundColor: accentDark }}
    >
      {/* Animated floating circles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ul className="absolute inset-0 m-0 p-0 list-none">
          {[
            { left: '25%', w: 80,  h: 80,  delay: '0s',  dur: '25s' },
            { left: '10%', w: 20,  h: 20,  delay: '2s',  dur: '12s' },
            { left: '70%', w: 20,  h: 20,  delay: '4s',  dur: '25s' },
            { left: '40%', w: 60,  h: 60,  delay: '0s',  dur: '18s' },
            { left: '65%', w: 20,  h: 20,  delay: '0s',  dur: '25s' },
            { left: '75%', w: 110, h: 110, delay: '3s',  dur: '25s' },
            { left: '35%', w: 150, h: 150, delay: '7s',  dur: '25s' },
            { left: '50%', w: 25,  h: 25,  delay: '15s', dur: '45s' },
            { left: '20%', w: 15,  h: 15,  delay: '2s',  dur: '35s' },
            { left: '85%', w: 150, h: 150, delay: '0s',  dur: '11s' },
          ].map((c, i) => (
            <li
              key={i}
              className="absolute block"
              style={{
                left: c.left, width: c.w, height: c.h, bottom: '-150px',
                background: 'rgba(255,255,255,0.2)',
                animation: `offerDefaultFloat ${c.dur} linear ${c.delay} infinite`,
              }}
            />
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes offerDefaultFloat {
          0%   { transform: translateY(0) rotate(0deg);        opacity: 1; border-radius: 0; }
          100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; }
        }
      `}</style>

      {offerReady && (
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <h2 className="text-white text-center mb-4 text-3xl md:text-[40px] font-bold capitalize leading-tight">
            LIMITED TIME: Get your{' '}
            <span className="text-white">{currentMonth}</span>{' '}
            starter package now!
          </h2>

          <div className="flex flex-col md:flex-row gap-6">
            {/* CTA column */}
            <div className="flex flex-col items-center justify-center text-center md:w-1/2">
              <button
                onClick={handleCta}
                aria-label="Secure your spot - Beginner classes enrolling right now"
                className="w-full text-white py-5 px-6 rounded block cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                <p className="m-0 text-[22px] md:text-[36px] font-bold tracking-widest capitalize leading-none"
                   style={{ fontFamily: 'Khand, sans-serif' }}>
                  Secure Your Spot!
                </p>
                <span className="text-xs md:text-xl font-bold">
                  Beginner classes enrolling right now!
                </span>
              </button>
              <p className="text-white mt-3 text-lg">
                Risk Free! 100% Satisfaction Guaranteed!
              </p>
            </div>

            {/* Bullets column */}
            <div className="md:w-1/2 flex flex-col justify-center px-4">
              <ul className="list-none p-0 m-0 space-y-2">
                <li className="text-white text-lg md:text-[22px] font-semibold leading-snug">
                  {whatYouGet}
                </li>
                {offers.length === 0 ? (
                  <li className="flex gap-3 items-start">
                    <CheckCircleIcon />
                    <span className="text-white text-lg md:text-[22px] leading-snug">{classOffer}</span>
                  </li>
                ) : (
                  offers.map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <CheckCircleIcon />
                      <span className="text-white text-lg md:text-[22px] leading-snug">{item}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Bottom note bar */}
          <div className="mt-6">
            <p
              className="text-center text-white py-3 text-lg"
              style={{ backgroundColor: accentColor }}
            >
              The program YOU need to start achieving the results you have been dreaming of!
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
