'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

export function AboutMe({ headline, media, customBullets }: SectionProps) {
  const bulletArr = Array.isArray(customBullets) ? customBullets : []
  const evenBullets = bulletArr.filter((_, i) => i % 2 === 0)
  const oddBullets = bulletArr.filter((_, i) => i % 2 !== 0)
  const imgUrl = media && media.length ? buildMediaUrl(media[0]) : ''

  return (
    <div className="bg-[#f2f2f2] py-16">
      {/* Heading */}
      <div className="text-center pt-10 mb-4">
        <h6 className="text-2xl font-bold" style={{ color: 'var(--org-primary)' }}>
          ABOUT ME
        </h6>
        <h3 className="text-4xl font-bold text-[#171d29] leading-tight">
          {headline}
        </h3>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 mt-12">
          {/* Left column — even bullets */}
          <div className="w-full md:w-1/3 mt-10 md:mt-14">
            {evenBullets.map((bullet: any, i: number) => (
              <div key={i} className="flex mb-10">
                <div className="relative mr-8 flex-shrink-0">
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-[#e2133a]" />
                  <Image
                    src={bullet.media ? buildMediaUrl(bullet.media) : ''}
                    alt={bullet.headline || 'Icon'}
                    width={50}
                    height={50}
                    className="relative z-10 object-contain"
                    style={{ maxWidth: 'none' }}
                  />
                </div>
                <div>
                  <h6 className="text-xl font-bold mb-2">{bullet.headline}</h6>
                  <p>{bullet.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Center — main image */}
          <div className="w-full md:w-1/3 text-center">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={headline || 'About me image'}
                width={400}
                height={600}
                className="w-full max-w-full h-auto"
              />
            )}
          </div>

          {/* Right column — odd bullets */}
          <div className="w-full md:w-1/3 mt-10 md:mt-14">
            {oddBullets.map((bullet: any, i: number) => (
              <div key={i} className="flex mb-10 justify-end">
                <div className="text-right mr-8">
                  <h6 className="text-xl font-bold mb-2">{bullet.headline}</h6>
                  <p>{bullet.content}</p>
                </div>
                <div className="relative flex-shrink-0">
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-[#e2133a]" />
                  <Image
                    src={bullet.media ? buildMediaUrl(bullet.media) : ''}
                    alt={bullet.headline || 'Icon'}
                    width={50}
                    height={50}
                    className="relative z-10 object-contain"
                    style={{ maxWidth: 'none' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
