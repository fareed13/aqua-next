'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function StepsIcons({ headline, customBullets }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets.slice(0, 3) : []

  return (
    <div className="bg-white py-12 px-4">
      <div className="relative mx-auto max-w-6xl">
        <h2 className="text-center text-[36px] font-bold">{headline}</h2>
        {/* Connecting line (hidden on mobile) */}
        <hr className="absolute hidden border-none border-t border-[#acacac] md:block"
          style={{ marginTop: '120px', width: '100%', left: 0, right: 0, maxWidth: '750px', margin: '0 auto', top: '170px' }}
        />

        {bullets.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {bullets.map((bullet: any, i: number) => (
              <div key={i} className="px-5 py-2.5">
                <div className="relative mx-auto h-[100px] w-[100px] overflow-hidden rounded-full bg-red-500">
                  {bullet.media && (
                    <Image
                      src={buildMediaUrl(bullet.media)}
                      alt="Step icon"
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-5 text-center">
                  <h3 className="mt-2.5 text-[22px] font-bold">{bullet.headline}</h3>
                  <p className="text-[15px] text-[#585d6c]">{bullet.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
