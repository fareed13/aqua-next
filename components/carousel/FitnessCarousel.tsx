'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function FitnessCarousel({ headline, customBullets }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = organization?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  const [model, setModel] = useState(0)

  const bullets = Array.isArray(customBullets) ? customBullets : customBullets ? [customBullets] : []
  const total = bullets.length

  const next = useCallback(() => {
    setModel(s => (s + 1) % total)
  }, [total])

  useEffect(() => {
    if (total <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, total])

  if (!total) return null

  return (
    <div className="relative w-full h-[500px] md:h-[800px] overflow-hidden">
      {bullets.map((bullet: any, i: number) => {
        const imgSrc = bullet.media ? buildMediaUrl(bullet.media, 800) : ''
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === model ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-label={`Slide ${i + 1} of ${total}`}
          >
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={headline || bullet.content || `Carousel image ${i + 1}`}
                fill
                className="object-cover w-full"
                priority={i === 0}
              />
            )}

            <div className="absolute inset-0 bg-black/20" />

            {/* Caption */}
            <div className="absolute top-[10%] md:top-[20%] left-0 right-0 z-10 px-4 md:px-8 max-w-[850px]">
              {headline && (
                <h1 className="text-white text-[30px] md:text-[50px] font-bold mb-2">
                  {headline}
                </h1>
              )}
              {bullet.content && (
                <p
                  className="text-white text-sm md:text-xl font-light pl-3 ml-1 mb-4"
                  style={{ borderLeft: `5px solid ${accentColor}` }}
                >
                  {bullet.content}
                </p>
              )}
              <button
                onClick={() => setDialog(true)}
                style={{ backgroundColor: accentColor }}
                className="text-white px-6 py-3 mt-4 ml-1 font-medium hover:opacity-90 transition"
                aria-label={cta}
              >
                {cta}
              </button>
            </div>
          </div>
        )
      })}

      {/* Nav */}
      {total > 1 && (
        <>
          <button
            onClick={() => setModel(s => (s - 1 + total) % total)}
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
