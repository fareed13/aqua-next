'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useOffers } from '@/hooks/useOffers'
import { useAuth } from '@/hooks/useAuth'
import { useInterestedServices } from '@/hooks/useInterestedServices'

const ArrowRightThick = ({ size = 25 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 text-black">
    <path d="M14,16.94V12.94H5.08L5.05,10.93H14V6.94L19,11.94L14,16.94Z" />
  </svg>
)

export function OfferGeneral({ headline, subtitle, content, media, plan }: SectionProps) {
  const accentColor = useOrgStore(s => s.organization?.colors?.['app-main-accent-color']) ?? '#d5242c'
  const setSelectedPlan = useUiStore(s => s.setSelectedPlan)
  const { isLoggedIn } = useAuth()
  const { setInterestedService } = useInterestedServices()

  const {
    offerReady,
    classOfferOnly,
    newPrice,
    currencySign,
    offers,
    getComponentPlan,
    setDialog,
  } = useOffers({ component_plan_id: plan ?? null })

  const imgSrc = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  const isFree = typeof newPrice === 'string' && newPrice.toLowerCase() === 'free'

  const handleCta = () => {
    if (isLoggedIn()) return
    setDialog(true)
    const componentPlan = getComponentPlan(plan ?? null)
    if (componentPlan) {
      setSelectedPlan(componentPlan.plan as Record<string, unknown>)
      if (componentPlan.service) setInterestedService(componentPlan.service)
    }
  }

  if (!offerReady) return null

  return (
    <section className="py-12 overflow-hidden check-out-below">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left content — 7 cols on md */}
          <div className="w-full md:w-7/12 py-4">
            {headline && (
              <h2 className="text-[35px] uppercase leading-tight font-bold mb-2">
                {headline}
              </h2>
            )}

            {subtitle && (
              <h4
                className="text-[26px] font-bold relative ml-[60px] mb-4"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                <span
                  className="absolute top-[18px] left-[-60px] w-[50px] border-t-2"
                  style={{ borderColor: accentColor }}
                />
                {subtitle}
                <span
                  className="absolute top-[18px] w-[50px] border-t-2 ml-[10px]"
                  style={{ borderColor: accentColor }}
                />
              </h4>
            )}

            {content && (
              <div className="mb-4" dangerouslySetInnerHTML={{ __html: content }} />
            )}

            <ul className="my-5 space-y-2 list-none p-0 m-0">
              {classOfferOnly && (
                <li className="flex items-center gap-2">
                  <ArrowRightThick size={25} />
                  <span>{classOfferOnly}</span>
                </li>
              )}
              {offers.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <ArrowRightThick size={25} />
                  <span>{item}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <ArrowRightThick size={25} />
                <span>Limited Time Offer / New Clients Only</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRightThick size={35} />
                <span>
                  100% Money Back Guarantee. If you&apos;re not completely satisfied for any reason,
                  we will refund your purchase no questions asked
                </span>
              </li>
            </ul>

            {/* Price oval */}
            {newPrice ? (
              <div className="inline-flex items-center gap-3 mb-2">
                <div
                  className="flex items-center justify-center rounded-full font-bold text-white text-[40px]"
                  style={{
                    fontFamily: 'Khand, sans-serif',
                    width: 150,
                    height: 150,
                    background: accentColor,
                    boxShadow: '2px 2px 3px #777777',
                  }}
                >
                  {!isFree ? currencySign : ''}{newPrice}
                </div>
              </div>
            ) : null}
            {classOfferOnly && (
              <span
                className="text-[24px] font-bold ml-3"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                / {classOfferOnly}
              </span>
            )}

            {/* CTA button */}
            <button
              onClick={handleCta}
              aria-label="Secure your spot - Beginner classes enrolling right now"
              className="w-full text-white py-5 px-6 rounded block mt-4 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <p
                className="m-0 text-[22px] md:text-[30px] font-bold tracking-widest capitalize leading-none"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                Secure your spot!
              </p>
              <span className="text-sm md:text-base font-bold">
                Beginner classes enrolling right now!
              </span>
            </button>
          </div>

          {/* Right image — 5 cols on md */}
          <div className="w-full md:w-5/12">
            {imgSrc && (
              <div
                className="relative w-full"
                style={{ boxShadow: `-15px -15px 0 ${accentColor}` }}
              >
                <Image
                  src={imgSrc}
                  alt={headline || 'Offer image'}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
