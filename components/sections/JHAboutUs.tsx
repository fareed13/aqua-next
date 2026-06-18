'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JHAboutUs({ headline, content, media, customBullets }: SectionProps) {
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''
  const bullets = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left image */}
          <div className="flex items-start justify-center pt-0 md:w-1/2 md:pt-[170px] md:pr-12">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={headline || 'About us image'}
                width={600}
                height={380}
                className="h-auto w-full object-cover"
              />
            )}
          </div>

          {/* Right content */}
          <div className="md:w-1/2">
            <div className="mt-8 mb-10 md:mt-[100px]">
              <h4 className="text-lg font-medium uppercase text-[#00a11a]">About Us</h4>
              <h3 className="mb-5 text-[28px] font-normal text-black md:text-[40px]">
                {headline}
              </h3>
              {content && (
                <div
                  className="text-lg text-[#6e727a]"
                  dangerouslySetInnerHTML={{ __html: content ?? '' }}
                />
              )}
            </div>

            {bullets.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {bullets.map((bullet: any, i: number) => (
                  <div key={i} className="about-box">
                    <div className="mb-3 min-h-[60px]">
                      {bullet.media && (
                        <Image
                          src={buildMediaUrl(bullet.media)}
                          alt={bullet.headline || 'Icon'}
                          width={95}
                          height={42}
                          className="object-contain"
                        />
                      )}
                    </div>
                    <h5 className="max-w-[170px] text-2xl font-medium leading-[29px] text-black">
                      {bullet.headline}
                    </h5>
                    <p className="mt-2 text-[17px] text-[#6e727a]">{bullet.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
