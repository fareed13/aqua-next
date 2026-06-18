'use client'

import Image from 'next/image'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function ImproveWorkout({ headline, customBullets, media }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  const bullets = Array.isArray(customBullets) ? customBullets : []
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  return (
    <div className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left content */}
          <div className="md:w-7/12">
            <div className="relative pb-6">
              <h3 className="text-[28px] font-bold leading-tight md:text-[40px]">
                <span>{headline}</span>
              </h3>
              <span className="absolute bottom-0 left-0 h-1.5 w-[70px] rounded-full bg-[#d5242c]" />
            </div>

            <div className="mt-20 space-y-9">
              {bullets.map((bullet: any, i: number) => (
                <div key={i} className="flex flex-col gap-4 md:flex-row">
                  <div className="md:w-1/6">
                    {bullet.media && (
                      <Image
                        src={buildMediaUrl(bullet.media)}
                        alt={bullet.headline || 'Icon'}
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className="md:w-5/6">
                    <h4 className="mb-2 text-xl font-bold text-[#171d29]">
                      {bullet.headline || ''}
                    </h4>
                    <p className="text-sm text-gray-600">{bullet.content || ''}</p>
                    <button
                      onClick={() => setDialog(true)}
                      className="mt-2 flex items-center gap-1 text-[#d5242c] text-sm font-medium"
                      aria-label="Read more"
                    >
                      Read more &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="md:w-5/12">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={headline || 'Workout image'}
                width={600}
                height={400}
                className="h-auto w-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
