'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function DentalBannerCarousel({ customBullets }: SectionProps) {
  const org = useOrgStore((s) => s.organization)
  const loc = useOrgStore((s) => s.location)
  const setDialog = useUiStore((s) => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = org?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  const [carousel, setCarousel] = useState(0)

  const bullets = Array.isArray(customBullets) ? customBullets.slice(0, 3) : []
  const total = bullets.length

  const next = useCallback(() => {
    setCarousel((s) => (s + 1) % total)
  }, [total])

  // Auto-cycle
  useEffect(() => {
    if (total <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, total])

  if (!total) return null

  return (
    <div className="relative w-full overflow-hidden h-[400px] md:h-[500px]" aria-label="Dental banner carousel">
      {bullets.map((bullet: any, i: number) => {
        const imgSrc = bullet.media ? buildMediaUrl(bullet.media, 'large') : ''
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === carousel ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-label={bullet.headline || `Carousel slide ${i + 1}`}
          >
            {/* Background image */}
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={bullet.headline || 'Carousel image'}
                fill
                className="object-contain w-full h-full"
                priority={i === 0}
                sizes="100vw"
              />
            )}

            {/* Caption */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
              <div className="max-w-[850px] mx-auto mt-[80px] md:mt-0">
                <div className="flex items-center justify-center h-[90px]">
                  <h3 className="text-white text-[31px] md:text-[40px] font-light text-center leading-[37px]">
                    {bullet.headline || ''}
                  </h3>
                </div>
                {bullet.content && (
                  <p className="text-white text-base md:text-[18px] font-light text-center">
                    {bullet.content}
                  </p>
                )}
                <button
                  onClick={() => setDialog(true)}
                  style={{ backgroundColor: accentColor }}
                  className="text-white px-7 py-3 mt-4 mx-auto block tracking-wider font-medium hover:opacity-90 transition"
                  aria-label={cta}
                >
                  {cta}
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Dots navigation */}
      {total > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
          {bullets.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCarousel(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-3 h-3 rounded-full transition ${i === carousel ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={() => setCarousel((s) => (s - 1 + total) % total)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition"
          >
            &#8249;
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition"
          >
            &#8250;
          </button>
        </>
      )}
    </div>
  )
}
