'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function StepsBoxed({ headline, customBullets }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets.slice(0, 3) : []

  return (
    <div className="bg-[#dbdbdb]/10 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-[40px] font-bold">{headline}</h2>
        <div className="mt-0 grid grid-cols-1 gap-6 md:grid-cols-3">
          {bullets.map((bullet: any, i: number) => (
            <div
              key={i}
              className="mt-12 border-b-[3px] border-[#eeeeee] bg-white px-5 py-2.5"
            >
              <div className="relative mx-auto -mt-12 flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-full bg-red-500">
                {bullet.media && (
                  <Image
                    src={buildMediaUrl(bullet.media)}
                    alt="Step icon"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="mt-4 text-center">
                <h3 className="mt-2.5 text-[22px] font-bold">{bullet.headline || ''}</h3>
                <p className="text-[15px] text-[#585d6c]">{bullet.content || ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
