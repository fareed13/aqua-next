'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function GetStarted({ headline, customBullets, backgroundImage }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  const bgUrl = backgroundImage || ''

  return (
    <div
      className="relative min-h-[440px] bg-cover bg-center py-12 px-4"
      style={{ backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined }}
    >
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: '#0b6ca3b3' }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Heading */}
        {headline && (
          <div className="text-center mb-5">
            <h3
              className="text-white text-[22px] md:text-[33px] uppercase font-bold"
              style={{ color: accentColor }}
            >
              {headline}
            </h3>
          </div>
        )}

        {/* Circle cards */}
        {customBullets && customBullets.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {customBullets.map((bullet: any, i: number) => {
              const iconUrl = bullet.media ? buildMediaUrl(bullet.media) : ''
              return (
                <div key={i} className="text-center w-full sm:w-1/2 md:w-1/4 max-w-[250px]">
                  <div
                    className="border w-[150px] md:w-[200px] h-[150px] md:h-[200px] rounded-full mx-auto p-1 relative overflow-hidden"
                    style={{ borderColor: accentColor }}
                  >
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt={bullet.headline || 'Get started icon'}
                        width={200}
                        height={200}
                        className="w-full h-full object-contain rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white/10" />
                    )}
                  </div>
                  {bullet.headline && (
                    <h3
                      className="text-white relative text-[14px] md:text-[20px] mt-4 uppercase tracking-wide leading-[26px]"
                      style={{ color: accentColor }}
                    >
                      {bullet.headline}
                    </h3>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
