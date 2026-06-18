'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function SalonInfoCard({ customBullets }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="relative z-10 mt-16 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {bullets.map((bullet: any, i: number) => (
            <div
              key={i}
              className="flex items-start gap-4 overflow-hidden px-5 py-8 shadow-[0px_10px_18px_#cccccc59]"
              style={{
                background: i % 2 === 1 ? 'var(--org-primary)' : '#fff',
              }}
            >
              <div className="shrink-0">
                {bullet.media && (
                  <Image
                    src={buildMediaUrl(bullet.media)}
                    alt={bullet.headline || 'Information icon'}
                    width={65}
                    height={65}
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <span
                  className="block text-lg"
                  style={{ color: i % 2 === 0 ? 'var(--org-primary)' : '#fff' }}
                >
                  {bullet.content}
                </span>
                <strong
                  className="text-2xl"
                  style={{ color: i % 2 === 1 ? '#fff' : '#000' }}
                >
                  {bullet.headline}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
