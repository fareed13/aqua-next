'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function AccountWhatWeOffer({ headline, subtitle, customBullets }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const bulletArr = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="mb-5 text-center">
          <h4
            className="text-xl flex items-center justify-center gap-2 max-w-[195px] mx-auto"
            style={{ color: 'var(--org-primary)' }}
          >
            <span className="flex-1 border-t border-current" />
            Our Services
            <span className="flex-1 border-t border-current" />
          </h4>
          {headline && (
            <h2 className="text-3xl md:text-[43px] mt-1">{headline}</h2>
          )}
        </div>

        {/* Scrollable service cards */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {bulletArr.map((bullet: any, i: number) => {
            const imgUrl = bullet.media ? buildMediaUrl(bullet.media) : ''
            return (
              <div
                key={i}
                className="flex-shrink-0 snap-start bg-white shadow-lg max-w-[360px] w-72 mb-10"
              >
                {imgUrl && (
                  <div className="relative w-full h-48">
                    <Image
                      src={imgUrl}
                      alt={bullet.headline || 'Service image'}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="m-0 text-[#212529]">{bullet.headline}</h3>
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
                className="border-b-2 border-current rounded-none px-0 ml-1"
                style={{ color: 'var(--org-primary)' }}
                aria-label={cta}
              >
                {cta}
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-0.5 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
