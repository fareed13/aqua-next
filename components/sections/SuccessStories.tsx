'use client'

import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

export function SuccessStories({ headline, customBullets }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="py-10 pt-10 pb-12 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-5 text-center">
          <h3 className="relative text-[33px] uppercase text-[#333]">{headline}</h3>
          <hr
            className="mx-auto mt-2.5 w-[150px] border-t-[3px]"
            style={{ borderColor: 'var(--org-primary)' }}
          />
        </div>

        {bullets.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {bullets.map((bullet: any, i: number) => (
              <div key={i}>
                {/* Video/image placeholder */}
                <div className="max-h-[260px] bg-gray-200">
                  {bullet.media && (bullet.media as any).type === 'video' ? (
                    <div className="flex h-[260px] items-center justify-center bg-gray-800 text-white text-sm">
                      Video
                    </div>
                  ) : bullet.media ? (
                    <div className="flex h-[260px] items-center justify-center overflow-hidden">
                      <img
                        src={buildMediaUrl(bullet.media)}
                        alt={bullet.headline || 'Story image'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="relative bg-[#9e9e9e]/5 p-5 pr-12">
                  <h3
                    className="mb-2.5 line-clamp-2 text-[17px] font-bold uppercase leading-[25px]"
                    style={{ color: 'var(--org-primary)' }}
                  >
                    {bullet.headline}
                  </h3>
                  <p className="line-clamp-3 text-[15px]">{bullet.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
