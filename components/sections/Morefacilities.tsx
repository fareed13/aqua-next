'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function Morefacilities({ headline, subtitle, customBullets }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="bg-[#1f2229] py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mt-5 mb-5">
          <strong className="flex items-center gap-2.5 text-lg uppercase text-white">
            <span className="inline-block h-px w-[50px] border border-current" />
            {headline}
          </strong>
          <h3
            className="mb-5 text-[33px] uppercase"
            style={{ color: 'var(--org-primary)' }}
          >
            {subtitle}
          </h3>
        </div>

        {bullets.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {bullets.map((bullet: any, i: number) => (
              <div key={i}>
                {bullet.media && (
                  <Image
                    src={buildMediaUrl(bullet.media)}
                    alt={bullet.headline || 'Facility image'}
                    width={600}
                    height={250}
                    className="h-[250px] w-full object-cover"
                  />
                )}
                <div className="bg-[#181a1f] px-5 py-5">
                  <h3
                    className="mb-2.5 text-base"
                    style={{ color: 'var(--org-primary)' }}
                  >
                    {bullet.headline}
                  </h3>
                  <p className="text-[#8d8d8d] text-sm">{bullet.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
