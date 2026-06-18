'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import type { SectionProps } from '@/components/sections/registry'

export function SalonTestimonials({ headline, backgroundImage }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const reviews: any[] = (loc as any)?.reviews ?? []
  const [currentSlide, setCurrentSlide] = useState(0)

  const bgUrl = backgroundImage
    ? `${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${backgroundImage}`
    : ''

  const canGoPrev = currentSlide > 0
  const canGoNext = currentSlide < reviews.length - 1

  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto table text-center">
          <strong
            className="mb-2 block text-xl"
            style={{ color: 'var(--org-primary)' }}
          >
            {headline}
          </strong>
          <div className="flex items-center gap-2.5">
            <span style={{ color: 'var(--org-primary)', fontSize: 30 }}>&#8764;</span>
            <h3 className="text-[34px] font-normal capitalize md:text-[40px]">Testimonials</h3>
            <span style={{ color: 'var(--org-primary)', fontSize: 30 }}>&#8764;</span>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mx-auto mt-4 max-w-[870px]">
            {(() => {
              const review = reviews[currentSlide]
              return (
                <div className="pt-8 text-center">
                  <p className="mx-auto mb-4 text-sm leading-[21px] text-[#333] md:text-base md:leading-[26px]">
                    {review.content}
                  </p>
                  <hr
                    className="mx-auto mb-5 w-24"
                    style={{ borderColor: 'var(--org-primary)' }}
                  />
                  {review.media && review.media.extension !== 'mp4' && (
                    <Image
                      src={review.media.name}
                      alt={`${review.name} profile picture`}
                      width={70}
                      height={70}
                      className="mx-auto mb-4 h-[39px] w-[39px] rounded-full object-cover md:h-[70px] md:w-[70px]"
                    />
                  )}
                  <h3 className="mt-4 text-xl font-medium text-[#333] md:text-2xl md:text-[26px]">
                    {review.name}
                  </h3>
                </div>
              )
            })()}

            {reviews.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => canGoPrev && setCurrentSlide(s => s - 1)}
                  disabled={!canGoPrev}
                  aria-label="Previous testimonial"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-white/20 transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  &lsaquo;
                </button>
                <button
                  onClick={() => canGoNext && setCurrentSlide(s => s + 1)}
                  disabled={!canGoNext}
                  aria-label="Next testimonial"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-white/20 transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
