'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function Carousel360({ headline, media }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)'

  const slides = media && media.length > 0
    ? media.map(m => buildMediaUrl(m, 1200))
    : []

  const totalSlides = slides.length
  const [currentSlide, setCurrentSlide] = useState(0)

  const prev = useCallback(() => {
    setCurrentSlide(s => (s - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  const next = useCallback(() => {
    setCurrentSlide(s => (s + 1) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (totalSlides <= 1) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, totalSlides])

  const currentMonth = MONTHS[new Date().getMonth()]

  if (totalSlides === 0) {
    return (
      <div className="relative w-full h-[500px] bg-gray-800 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-[60px] font-bold uppercase mb-4">
            Set Your <span style={{ color: accentColor }}>Goals </span>And Achieve Them!
          </h1>
          <p className="text-2xl md:text-4xl">
            Beginner Classes Enrolling In {currentMonth}!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-slider relative">
      <div className="relative overflow-hidden w-full h-[500px] md:h-[600px]">
        {slides.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-label={`Slide ${i + 1}`}
          >
            <Image
              src={src}
              alt={headline || `Slide ${i + 1}`}
              fill
              className="object-cover"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center flex-col text-center px-4">
          <h1 className="text-white text-3xl md:text-[60px] font-bold uppercase pb-0 mb-0">
            Set Your{' '}
            <span style={{ color: accentColor }}>Goals </span>
            And Achieve Them!
          </h1>
          <p className="text-white text-2xl md:text-[36px] font-bold mt-2">
            Beginner Classes Enrolling In {currentMonth}!
          </p>
        </div>

        {/* Nav buttons */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prev}
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

        {/* Dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
            {slides.map((_, i) => (
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
    </div>
  )
}
