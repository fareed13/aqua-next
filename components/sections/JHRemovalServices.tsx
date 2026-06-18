'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JHRemovalServices({ headline, content, customBullets }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="py-20 px-4">
      <div className="mb-8 text-center">
        <h3 className="text-[28px] font-medium uppercase text-black md:text-[35px]">
          {headline}
        </h3>
        {content && (
          <div
            className="mx-auto text-[#6e727a]"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        )}
      </div>

      {bullets.length > 0 && (
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {bullets.map((bullet: any, i: number) => (
              <div
                key={i}
                className="relative min-h-[250px] p-4 md:p-8"
                style={{
                  background: i % 2 === 1 ? '#00a11a' : '#f9f9f9',
                  color: i % 2 === 1 ? '#fff' : 'inherit',
                }}
              >
                {bullet.media && (
                  <div className="mb-4">
                    <Image
                      src={buildMediaUrl(bullet.media)}
                      alt={bullet.headline || 'Service icon'}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                )}
                <strong className="mb-1 block text-base">{bullet.headline}</strong>
                <p className="text-xs md:text-sm">{bullet.content}</p>
                <span
                  className="absolute right-5 bottom-10 text-lg"
                  style={{ color: i % 2 === 1 ? '#fff' : '#333' }}
                >
                  &rarr;
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
