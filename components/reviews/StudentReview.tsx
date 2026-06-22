'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

const REVIEW_BACKGROUND_PATH = 'review-background.png'

const slides = [
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tincidunt sem non nunc semper Phasellus at ex ut lorem luctus sagittis eu eu nisi. Duis tristique ultrices velit ac dapibus. Cras quis faucibus lacus. Integer elementum dapibus hendrerit. Nunc facilisis',
    img: '/assets/img/steve-martin.jpg',
    name: 'Steve Martin',
    title: 'Family Member',
  },
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tincidunt sem non nunc semper Phasellus at ex ut lorem luctus sagittis eu eu nisi. Duis tristique ultrices velit ac dapibus. Cras quis faucibus lacus. Integer elementum dapibus hendrerit. Nunc facilisis',
    img: '/assets/img/steve-martin.jpg',
    name: 'Steve Martin2',
    title: 'Family Member',
  },
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tincidunt sem non nunc semper Phasellus at ex ut lorem luctus sagittis eu eu nisi. Duis tristique ultrices velit ac dapibus. Cras quis faucibus lacus. Integer elementum dapibus hendrerit. Nunc facilisis',
    img: '/assets/img/steve-martin.jpg',
    name: 'Steve Martin3',
    title: 'Family Member',
  },
]

export function StudentReview(_props: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const accentDarker = organization?.colors?.['app-darker-background'] ?? '#1a1a2e'

  const reviewBg = (process.env.NEXT_PUBLIC_MEDIA_URL ?? '') + REVIEW_BACKGROUND_PATH

  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = slides.length

  const next = useCallback(() => {
    setCurrentSlide(s => (s + 1) % totalSlides)
  }, [totalSlides])

  // Auto-cycle
  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  const slide = slides[currentSlide]

  return (
    <div
      className="relative text-white pt-8 pb-28 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(213, 36, 44, 0.8), rgba(213, 36, 44, 0.8)), url(${reviewBg})`,
        backgroundPosition: 'top',
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="uppercase text-center font-bold text-2xl md:text-3xl text-white my-12 mb-2">
          Member Review
        </h2>

        <div className="text-center mx-auto max-w-[890px]">
          <p className="text-base mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Etiam eu hendrerit tortor,<br className="hidden md:block" />
            at commodo ligula. Mauris pharetra porttitor tristique.
            Sed vel ipsum nibh.
          </p>

          {/* Carousel slide */}
          <div className="min-h-[450px] flex flex-col items-center justify-start px-6">
            <h3 className="mt-5 uppercase text-2xl font-semibold">We love karate</h3>

            {/* Quote */}
            <div className="relative my-4 text-[17px] leading-[1.8] max-w-2xl">
              <span className="relative inline-block mr-2 top-[2px]">
                <Image
                  src="/assets/img/quote-open.png"
                  alt="Opening quote"
                  width={31}
                  height={31}
                  className="inline-block"
                />
              </span>
              {slide.quote}
              <span className="relative inline-block ml-2 top-[14px]">
                <Image
                  src="/assets/img/quote-close.png"
                  alt="Closing quote"
                  width={31}
                  height={31}
                  className="inline-block"
                />
              </span>
            </div>

            {/* Reviewer card */}
            <div className="mt-8 flex flex-col items-center">
              <div className="relative w-[100px] h-[100px] mb-3 rounded-full overflow-hidden border-2 border-white">
                <Image
                  src={slide.img}
                  alt={slide.name ? `${slide.name} profile picture` : 'Reviewer profile picture'}
                  fill
                  className="object-cover"
                />
              </div>
              <h5 className="text-[22px] font-normal mb-1">{slide.name}</h5>
              <p className="text-[18px]">{slide.title}</p>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-3 h-3 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative layers */}
      <div
        className="absolute left-[-60%] right-0 bottom-0 h-[100px] -mb-[50px]"
        style={{
          background: '#c8001e',
          transform: 'rotate(3deg)',
        }}
      />
      <div
        className="absolute left-[-60%] right-0 bottom-0 h-[100px] -mb-[85px]"
        style={{
          background: accentDarker,
          transform: 'rotate(1deg)',
        }}
      />
    </div>
  )
}
