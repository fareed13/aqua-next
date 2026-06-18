'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function AccountOurFeatures({ headline, subtitle, customBullets }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const bulletArr = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="bg-[#192d40] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h4
            className="text-xl flex items-center justify-center gap-2 max-w-[195px] mx-auto"
            style={{ color: 'var(--org-primary)' }}
          >
            <span className="flex-1 border-t border-current" />
            Our Features
            <span className="flex-1 border-t border-current" />
          </h4>
          {headline && (
            <h2 className="text-white text-3xl md:text-[43px] mt-1">{headline}</h2>
          )}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {bulletArr.map((bullet: any, i: number) => {
            const iconUrl = bullet.media ? buildMediaUrl(bullet.media) : ''
            return (
              <div key={i} className="bg-[#091623] p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'var(--org-primary)' }}
                >
                  {iconUrl && (
                    <Image
                      src={iconUrl}
                      alt={bullet.headline || 'Feature icon'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full rounded-full"
                    />
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-white pb-4 font-normal">{bullet.headline}</h3>
                  <p className="text-[#868e96]">{bullet.content}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tagline */}
        {subtitle && (
          <div className="mt-10 text-center">
            <p className="text-[#868e96] flex items-center justify-center gap-1">
              {subtitle}
              <button
                onClick={() => setDialog(true)}
                className="text-white border-b-2 border-white rounded-none px-0 ml-1"
                aria-label={cta}
              >
                {cta}
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
