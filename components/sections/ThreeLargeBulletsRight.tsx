'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function ThreeLargeBulletsRight({ headline, customBullets, media }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets.slice(0, 3) : []
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  return (
    <div className="bg-[#dbdbdb]/10 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-[40px] font-bold">{headline}</h2>
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left image */}
          <div className="flex items-center justify-center md:w-5/12">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={headline || 'Section image'}
                width={600}
                height={400}
                className="h-auto w-full object-contain"
              />
            )}
          </div>

          {/* Right bullets */}
          <div className="md:w-7/12">
            {bullets.map((bullet: any, i: number) => (
              <div
                key={i}
                className="mb-5 flex gap-6 border-b-[3px] border-[#eeeeee] bg-white p-8"
              >
                <div className="shrink-0">
                  {bullet.media && (
                    <Image
                      src={buildMediaUrl(bullet.media)}
                      alt={bullet.headline || 'Step icon'}
                      width={100}
                      height={100}
                      className="h-[100px] w-[100px] rounded-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="mt-2.5 text-[22px] font-bold">{bullet.headline}</h3>
                  <p className="text-[15px] text-[#585d6c]">{bullet.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
