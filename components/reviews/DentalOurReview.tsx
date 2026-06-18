'use client'

import { useState } from 'react'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

export function DentalOurReview({ content, countOfReviews }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const allReviews = organization?.org_reviews ?? []
  const reviews = countOfReviews ? allReviews.slice(0, countOfReviews) : allReviews

  const [carousel, setCarousel] = useState(0)

  const goToPrev = () => setCarousel(prev => Math.max(0, prev - 1))
  const goToNext = () => setCarousel(prev => Math.min(reviews.length - 1, prev + 1))

  const review = reviews[carousel]

  return (
    <div className="py-8">
      <div className="max-w-[750px] mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h3 className="text-[28px] leading-[41px] text-black font-normal">
            What Our Patients Say
          </h3>
          {content && (
            <div
              className="uppercase text-[13px] my-2.5"
              style={{ color: 'var(--org-primary)' }}
              dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
          )}
        </div>

        {/* Review Carousel */}
        {reviews.length > 0 && (
          <div className="mt-12 relative">
            {/* Carousel track */}
            <div className="bg-[#e6e6e6] text-center px-6 md:px-24 py-16 min-h-[300px] flex flex-col justify-center relative overflow-hidden">
              {review && (
                <>
                  <div className="mb-6">
                    <p className="text-[22px] text-[#333] mb-6 md:text-2xl">{review.content}</p>
                    <h4
                      className="text-[15px] text-center font-normal tracking-widest"
                      style={{ color: 'var(--org-primary)' }}
                    >
                      - {review.name}
                    </h4>
                  </div>
                </>
              )}

              {/* Posted tagline */}
              {review?.platform && (
                <div className="absolute bottom-0 left-0 right-0 text-center text-black py-4 capitalize"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #e6e6e6, #cbcbcb 600px, #e6e6e6 800px)'
                  }}
                >
                  <p className="m-0 text-sm">This review was posted on {review.platform}</p>
                </div>
              )}
            </div>

            {/* Carousel navigation */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={goToPrev}
                disabled={carousel === 0}
                className="px-4 py-2 rounded-full text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: 'var(--org-primary)' }}
                aria-label="Previous review"
              >
                ‹
              </button>
              <span className="self-center text-sm text-gray-500">
                {carousel + 1} / {reviews.length}
              </span>
              <button
                onClick={goToNext}
                disabled={carousel === reviews.length - 1}
                className="px-4 py-2 rounded-full text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: 'var(--org-primary)' }}
                aria-label="Next review"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {/* Review CTA button */}
        <div className="text-center mt-10">
          <strong
            className="uppercase tracking-widest block mb-6"
            style={{ color: 'var(--org-primary)' }}
          >
            Find Our Reviews Online:
          </strong>
          <div className="flex justify-center">
            <a
              href="/reviews"
              className="inline-flex items-center justify-center gap-2 min-w-[250px] px-6 py-4 text-white rounded-[44px] font-normal no-underline text-sm md:text-base"
              style={{ backgroundColor: 'var(--org-primary)' }}
              aria-label="View all reviews"
            >
              <span aria-hidden="true">→</span>
              Reviews
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
