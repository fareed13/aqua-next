'use client'

import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useOffers } from '@/hooks/useOffers'
import { useAuth } from '@/hooks/useAuth'
import { useInterestedServices } from '@/hooks/useInterestedServices'

export function NewMemberOffer({ media, backgroundImage, plan }: SectionProps) {
  const accentColor = useOrgStore(s => s.organization?.colors?.['app-main-accent-color']) ?? '#d5242c'
  const setSelectedPlan = useUiStore(s => s.setSelectedPlan)
  const { isLoggedIn } = useAuth()
  const { setInterestedService } = useInterestedServices()

  const {
    newPrice,
    currencySign,
    classOfferNoPrice,
    getComponentPlan,
    setDialog,
  } = useOffers({ component_plan_id: plan ?? null })

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })

  const bgUrl =
    backgroundImage
      ? backgroundImage
      : media && media.length > 0
      ? buildMediaUrl(media[0])
      : '/assets/img/ordernow.jpg'

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

  return (
    <div
      className="ordernowcompo"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundPosition: 'left top',
        backgroundSize: 'cover',
        aspectRatio: '2',
        minHeight: 400,
        width: '100%',
      }}
    >
      <div className="w-full h-full px-4 py-8 flex items-center" style={{ height: '100%' }}>
        <div className="flex flex-col md:flex-row w-full h-full">
          {/* Content box: left 7 cols on md */}
          <div className="w-full md:w-7/12 flex justify-center items-center">
            <div
              className="w-full max-w-[500px] px-4 py-5"
              style={{ background: 'rgba(0,0,0,1)' }}
            >
              <h2
                className="uppercase text-center font-bold text-white leading-tight mb-2"
                style={{ fontFamily: 'Khand, sans-serif', fontSize: 50 }}
              >
                New member exclusive
              </h2>

              <hr className="mx-auto my-2 border-t border-white max-w-[480px]" />

              <h3
                className="uppercase text-center font-bold text-white mb-12 leading-tight"
                style={{ fontFamily: 'Khand, sans-serif', fontSize: 40 }}
              >
                <span style={{ color: accentColor }}>{currentMonth}</span>{' '}
                online offer!
              </h3>

              <div className="mx-auto max-w-[500px] text-center">
                <p
                  className="mb-0 text-white font-bold italic uppercase"
                  style={{ fontFamily: 'Khand, sans-serif', fontSize: 18, lineHeight: 0.5 }}
                >
                  One Payment of
                </p>

                {/* Price display */}
                <p
                  className="flex justify-center mb-0 text-white font-bold items-end"
                  style={{ fontFamily: 'Khand, sans-serif' }}
                >
                  <span style={{ fontSize: 50 }}>
                    {!isFree ? currencySign : ''}
                  </span>
                  <span style={{ fontSize: 100, lineHeight: 1.1 }}>
                    {newPrice || '—'}
                  </span>
                </p>

                <button
                  onClick={handleCta}
                  aria-label="Order now"
                  className="mt-5 mx-auto block font-extrabold text-black border-2 border-[#333333] cursor-pointer transition-all order-now"
                  style={{
                    fontFamily: 'Khand, sans-serif',
                    background: '#ffcc00',
                    height: 'auto',
                    fontSize: 36,
                    padding: '5px 15px',
                    borderRadius: 10,
                  }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = accentColor
                    el.style.color = '#ffffff'
                    el.style.borderColor = '#ffffff'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = '#ffcc00'
                    el.style.color = '#000000'
                    el.style.borderColor = '#333333'
                  }}
                >
                  Order Now
                </button>

                <p
                  className="text-center text-white uppercase font-extrabold italic mt-5 leading-snug"
                  style={{ fontFamily: 'Khand, sans-serif' }}
                >
                  {classOfferNoPrice || 'Beginner classes enrolling right now!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 959px) {
          .ordernowcompo { aspect-ratio: auto !important; min-height: 500px; }
          .ordernowcompo h2 { font-size: 28px !important; }
          .ordernowcompo h3 { font-size: 24px !important; }
        }
        @media (max-width: 599px) {
          .ordernowcompo h2 { font-size: 24px !important; }
          .ordernowcompo h3 { font-size: 20px !important; }
        }
      `}</style>
    </div>
  )
}
