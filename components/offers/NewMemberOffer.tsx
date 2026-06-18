'use client'

import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useUiStore } from '@/store/uiStore'

export function NewMemberOffer({ media, backgroundImage }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  const currentMonth = new Date().toLocaleString('default', { month: 'long' })

  // Use backgroundImage prop or first media item; fall back to bundled static asset
  const bgUrl =
    backgroundImage
      ? backgroundImage
      : media && media.length > 0
      ? buildMediaUrl(media[0])
      : '/assets/img/ordernow.jpg'

  return (
    <div
      className="relative w-full min-h-[400px] md:min-h-[500px]"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundPosition: 'left top',
        backgroundSize: 'cover',
        aspectRatio: '2 / 1',
      }}
    >
      <div className="w-full h-full px-4 py-8 flex items-center">
        <div className="flex flex-col md:flex-row w-full h-full">
          {/* Content box: left 7 cols on md */}
          <div className="w-full md:w-7/12 flex justify-center items-center">
            <div
              className="w-full max-w-[500px] px-4 py-5 md:py-5"
              style={{ background: 'rgba(0,0,0,1)' }}
            >
              <h2
                className="uppercase text-center font-bold text-white text-[24px] md:text-[50px] leading-tight mb-2"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                New member exclusive
              </h2>

              <hr className="mx-auto my-2 border-t border-white max-w-[480px]" />

              <h3
                className="uppercase text-center font-bold text-white text-[20px] md:text-[40px] mb-8 md:mb-12 leading-tight"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                <span style={{ color: 'var(--org-primary)' }}>{currentMonth}</span>{' '}
                online offer!
              </h3>

              <div className="mx-auto max-w-[350px] text-center px-0 md:px-2">
                <p
                  className="mb-0 text-white font-bold italic uppercase text-[14px] md:text-[18px]"
                  style={{ fontFamily: 'Khand, sans-serif', lineHeight: 0.5 }}
                >
                  One Payment of
                </p>

                {/* Price display */}
                <p
                  className="flex justify-center mb-0 text-white font-bold items-end"
                  style={{ fontFamily: 'Khand, sans-serif' }}
                >
                  <span className="text-[28px] md:text-[50px]">$</span>
                  <span
                    className="text-[56px] md:text-[100px]"
                    style={{ lineHeight: 1.1 }}
                  >
                    —
                  </span>
                </p>

                <button
                  onClick={() => setDialog(true)}
                  aria-label="Order now"
                  className="mt-5 mx-auto block text-[18px] md:text-[36px] font-extrabold py-[6px] px-4 md:py-[5px] md:px-[15px] rounded-[10px] border-2 border-[#333333] text-black transition-all cursor-pointer"
                  style={{
                    fontFamily: 'Khand, sans-serif',
                    background: '#ffcc00',
                    height: 'auto',
                  }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLButtonElement
                    el.style.background = 'var(--org-primary)'
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
                  className="text-center text-white uppercase font-extrabold italic mt-5 text-[12px] md:text-sm leading-snug"
                  style={{ fontFamily: 'Khand, sans-serif' }}
                >
                  Beginner classes enrolling right now!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
