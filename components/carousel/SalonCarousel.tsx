'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

export function SalonCarousel({ customBullets }: SectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const bullets = Array.isArray(customBullets) ? customBullets : customBullets ? [customBullets] : []
  const total = bullets.length

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1)
  }
  const nextSlide = () => {
    if (currentSlide < total - 1) setCurrentSlide(currentSlide + 1)
  }

  if (!total) return null

  return (
    <div className="relative" style={{ height: '670px' }}>
      {/* Slides */}
      {bullets.map((bullet: any, i: number) => {
        const imgSrc = bullet.media ? buildMediaUrl(bullet.media, 800) : ''
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            aria-label={bullet.headline || `Carousel slide ${i + 1}`}
          >
            {/* Background gradient overlay */}
            <div
              className="absolute inset-0 z-[9]"
              style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.82), rgba(255,255,255,0.07))' }}
            />

            {/* Background image */}
            {imgSrc && (
              <Image
                src={imgSrc}
                alt={bullet.headline || `Carousel image ${i + 1}`}
                fill
                className="object-cover w-full h-full"
                priority={i === 0}
              />
            )}

            {/* Caption */}
            <div className="absolute top-0 bottom-0 flex items-center z-[99] max-w-[800px] px-4 md:px-8">
              <div>
                {bullet.headline && (
                  <h3 className="text-white md:text-[42px] text-2xl font-normal mb-4">
                    {bullet.headline}
                  </h3>
                )}
                {bullet.content && (
                  <p className="text-white text-[19px] md:text-[25px] font-light leading-[42px]">
                    {bullet.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation buttons */}
      {total > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 md:px-[30px] z-[100] pointer-events-none">
          <button
            className="pointer-events-auto w-10 h-10 md:w-[50px] md:h-[50px] rounded-full border-none bg-white/90 text-black cursor-pointer flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={currentSlide === 0}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <span className="text-2xl leading-none">&#8249;</span>
          </button>
          <button
            className="pointer-events-auto w-10 h-10 md:w-[50px] md:h-[50px] rounded-full border-none bg-white/90 text-black cursor-pointer flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={currentSlide === total - 1}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <span className="text-2xl leading-none">&#8250;</span>
          </button>
        </div>
      )}
    </div>
  )
}
