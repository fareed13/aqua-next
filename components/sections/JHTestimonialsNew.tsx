'use client'

import { useState } from 'react'
import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JHTestimonialsNew({ headline, customBullets, backgroundImage }: SectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const bullets = Array.isArray(customBullets) ? customBullets : []

  const bgUrl = backgroundImage
    ? `${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${backgroundImage}`
    : ''

  const canGoPrev = currentSlide > 0
  const canGoNext = currentSlide < bullets.length - 1

  return (
    <div
      className="mb-24 px-4 py-[70px] text-center"
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <h3 className="text-[30px] font-normal uppercase text-white md:text-[50px]">
          {headline}
        </h3>

        {bullets.length > 0 && (
          <div className="mx-auto mt-6 max-w-[900px]">
            {(() => {
              const bullet = bullets[currentSlide] as any
              return (
                <div className="px-5 text-center md:px-12">
                  <p className="mb-5 text-sm leading-[22px] md:text-base md:leading-[29px]">
                    {bullet.content}
                  </p>
                  {bullet.media && (
                    <Image
                      src={buildMediaUrl(bullet.media)}
                      alt={`${bullet.headline} profile picture`}
                      width={49}
                      height={49}
                      className="mx-auto mb-1.5 rounded-full object-cover"
                    />
                  )}
                  <h3 className="mb-8 text-xl font-normal">{bullet.headline}</h3>
                </div>
              )
            })()}
          </div>
        )}

        {bullets.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => canGoPrev && setCurrentSlide(s => s - 1)}
              disabled={!canGoPrev}
              aria-label="Previous testimonial"
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/20 text-black backdrop-blur-sm transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              &bull;
            </button>
            <button
              onClick={() => canGoNext && setCurrentSlide(s => s + 1)}
              disabled={!canGoNext}
              aria-label="Next testimonial"
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/20 text-black backdrop-blur-sm transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              &bull;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
