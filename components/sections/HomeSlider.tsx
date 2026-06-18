'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function HomeSlider({ customBullets }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)
  const [currentSlide, setCurrentSlide] = useState(0)

  const bullets = Array.isArray(customBullets) ? customBullets : []
  if (bullets.length === 0) return null

  const canGoPrev = currentSlide > 0
  const canGoNext = currentSlide < bullets.length - 1

  const prevSlide = () => { if (canGoPrev) setCurrentSlide(s => s - 1) }
  const nextSlide = () => { if (canGoNext) setCurrentSlide(s => s + 1) }

  const bullet = bullets[currentSlide] as any

  return (
    <div className="relative h-[500px] overflow-hidden bg-[#f2f2f2] md:h-[600px]">
      {/* Slide image */}
      <div className="absolute inset-0 z-[1]">
        {bullet.media && (
          <Image
            src={buildMediaUrl(bullet.media)}
            alt={bullet.headline || `Slide ${currentSlide + 1}`}
            fill
            className="object-cover"
            priority={currentSlide === 0}
          />
        )}
      </div>

      {/* Heading */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center">
        <h3 className="text-center text-[57px] font-bold uppercase leading-[71px] text-white [text-shadow:0_0_40px_rgba(0,0,0,0.1)] md:text-[120px] md:leading-[131px] lg:text-[176px] lg:leading-[165px]">
          <span className="relative z-[999]">{bullet.headline}</span>
        </h3>
      </div>

      {/* CTA and nav */}
      <div className="absolute bottom-10 left-0 right-0 z-[2] flex flex-col items-center gap-5 md:bottom-[70px]">
        <button
          onClick={() => setDialog(true)}
          className="bg-[#d5242c] px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          aria-label="Join now"
        >
          Join Now
        </button>

        {bullets.length > 1 && (
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              disabled={!canGoPrev}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-30 md:h-[50px] md:w-[50px]"
            >
              &#8249;
            </button>
            <button
              onClick={nextSlide}
              disabled={!canGoNext}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-30 md:h-[50px] md:w-[50px]"
            >
              &#8250;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
