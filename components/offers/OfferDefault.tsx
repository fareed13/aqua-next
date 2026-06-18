'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useUiStore } from '@/store/uiStore'

export function OfferDefault({ bullets }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  const currentMonth = new Date().toLocaleString('default', { month: 'long' })

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []

  const whatYouGet = 'Included in your discounted starter package:'

  return (
    <section
      className="relative z-[3] py-9 px-0 overflow-hidden"
      style={{ backgroundColor: 'var(--org-primary-dark)' }}
    >
      {/* Animated floating circles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ul className="absolute inset-0 m-0 p-0 list-none">
          {[
            { left: '25%', w: 80, h: 80, delay: '0s', dur: '25s' },
            { left: '10%', w: 20, h: 20, delay: '2s', dur: '12s' },
            { left: '70%', w: 20, h: 20, delay: '4s', dur: '25s' },
            { left: '40%', w: 60, h: 60, delay: '0s', dur: '18s' },
            { left: '65%', w: 20, h: 20, delay: '0s', dur: '25s' },
            { left: '75%', w: 110, h: 110, delay: '3s', dur: '25s' },
            { left: '35%', w: 150, h: 150, delay: '7s', dur: '25s' },
            { left: '50%', w: 25, h: 25, delay: '15s', dur: '45s' },
            { left: '20%', w: 15, h: 15, delay: '2s', dur: '35s' },
            { left: '85%', w: 150, h: 150, delay: '0s', dur: '11s' },
          ].map((c, i) => (
            <li
              key={i}
              className="absolute block"
              style={{
                left: c.left,
                width: c.w,
                height: c.h,
                bottom: '-150px',
                background: 'rgba(255,255,255,0.2)',
                animation: `offerDefaultFloat ${c.dur} linear ${c.delay} infinite`,
              }}
            />
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes offerDefaultFloat {
          0%   { transform: translateY(0) rotate(0deg);       opacity: 1; border-radius: 0; }
          100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; }
        }
      `}</style>

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
              onClick={() => setDialog(true)}
              aria-label="Secure your spot - Beginner classes enrolling right now"
              className="w-full text-white py-5 px-6 rounded block cursor-pointer"
              style={{ backgroundColor: 'var(--org-primary)' }}
            >
              <p className="m-0 text-[22px] md:text-[36px] font-bold tracking-widest capitalize leading-none">
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
              {bulletList.length === 0 ? (
                <li className="flex gap-3 items-start">
                  <svg
                    className="flex-shrink-0 mt-1 text-white"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                  <span className="text-white text-lg md:text-[22px] leading-snug">
                    Trial class included
                  </span>
                </li>
              ) : (
                bulletList.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <svg
                      className="flex-shrink-0 mt-1 text-white"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-white text-lg md:text-[22px] leading-snug">
                      {item}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Bottom note bar */}
        <div className="mt-6 col-span-2">
          <p
            className="text-center text-white py-3 text-lg"
            style={{ backgroundColor: 'var(--org-primary)' }}
          >
            The program YOU need to start achieving the results you have been dreaming of!
          </p>
        </div>
      </div>
    </section>
  )
}
