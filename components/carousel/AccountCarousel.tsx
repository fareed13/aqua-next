'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function AccountCarousel({ customBullets }: SectionProps) {
  const org = useOrgStore((s) => s.organization)
  const loc = useOrgStore((s) => s.location)
  const setDialog = useUiStore((s) => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = org?.colors?.['app-main-accent-with-transparent'] || 'var(--org-primary)'

  const [currentSlide, setCurrentSlide] = useState(0)

  const bullets = Array.isArray(customBullets) ? customBullets : customBullets ? [customBullets] : []
  const total = bullets.length

  const next = useCallback(() => {
    setCurrentSlide((s) => (s + 1) % total)
  }, [total])

  // Auto-cycle
  useEffect(() => {
    if (total <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, total])

  if (!total) return null

  return (
    <div
      className="account-carousel relative w-full overflow-hidden"
      style={{ height: '700px' }}
      aria-label="Account carousel"
    >
      {bullets.map((bullet: any, i: number) => {
        const imgSrc = bullet.media ? buildMediaUrl(bullet.media, 800) : ''
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-label={bullet.headline || `Carousel slide ${i + 1}`}
          >
            {/* Image */}
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={bullet.headline || 'Carousel image'}
                fill
                className="object-contain w-full h-full"
                priority={i === 0}
              />
            )}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/56" />

            {/* Caption */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center max-w-[600px] px-4">
                {bullet.headline && (
                  <h3 className="text-white text-[35px] md:text-[56px] text-center leading-[49px] md:leading-[55px] mb-2">
                    {bullet.headline}
                  </h3>
                )}
                {bullet.content && (
                  <p className="text-white max-w-[400px] mx-auto">
                    {bullet.content}
                  </p>
                )}
                <button
                  onClick={() => setDialog(true)}
                  style={{ backgroundColor: accentColor }}
                  className="text-white px-6 py-4 mt-5 font-medium hover:opacity-90 transition"
                  aria-label={cta}
                >
                  {cta}
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation arrows (show on hover) */}
      {total > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((s) => (s - 1 + total) % total)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition opacity-0 hover:opacity-100 focus:opacity-100"
          >
            &#8249;
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition opacity-0 hover:opacity-100 focus:opacity-100"
          >
            &#8250;
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
          {bullets.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-3 h-3 rounded-full transition ${i === currentSlide ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
