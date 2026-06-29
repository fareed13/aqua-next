'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

export function DentalOurReview({ content, countOfReviews }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#0f4f8f'
  const allReviews = (organization as any)?.org_reviews ?? []
  const reviews = countOfReviews ? allReviews.slice(0, countOfReviews) : allReviews

  const [carousel, setCarousel] = useState(0)

  const goToPrev = () => setCarousel(prev => Math.max(0, prev - 1))
  const goToNext = () => setCarousel(prev => Math.min(reviews.length - 1, prev + 1))

  const review = reviews[carousel]

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center max-w-[750px] mx-auto">
          <h3 className="text-[28px] leading-[41px] text-black font-normal">
            What Our Patients Say
          </h3>
          {content && (
            <div
              className="uppercase text-[13px] my-2.5"
              style={{ color: accentColor }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        {/* Review Carousel */}
        {reviews.length > 0 && (
          <div className="mt-[50px] relative">
            {/* Carousel slide */}
            <div className="bg-[#e6e6e6] text-center px-[50px] md:px-[100px] relative overflow-hidden" style={{ height: 300 }}>
              {/* Left arrow */}
              <button
                onClick={goToPrev}
                disabled={carousel === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white text-3xl w-8 h-8 flex items-center justify-center disabled:opacity-30"
                style={{ backgroundColor: accentColor, borderRadius: '50%' }}
                aria-label="Previous review"
              >
                ‹
              </button>
              {/* Right arrow */}
              <button
                onClick={goToNext}
                disabled={carousel === reviews.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white text-3xl w-8 h-8 flex items-center justify-center disabled:opacity-30"
                style={{ backgroundColor: accentColor, borderRadius: '50%' }}
                aria-label="Next review"
              >
                ›
              </button>

              {review && (
                <div className="flex flex-col items-center justify-center h-full" aria-label={`Review by ${review.name}`}>
                  <div style={{ marginTop: -50 }}>
                    <div className="mb-6">
                      <p className="text-[22px] md:text-[16px] text-[#333] mb-[25px]">{review.content}</p>
                    </div>
                    <h4
                      className="text-[15px] text-center font-normal tracking-[1px]"
                      style={{ color: accentColor }}
                    >
                      - {review.name}
                    </h4>
                  </div>
                </div>
              )}

              {/* Posted tagline — absolute bottom */}
              {review?.platform && (
                <div
                  className="absolute bottom-0 left-0 right-0 text-center text-black py-[15px] capitalize"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #e6e6e6, #cbcbcb 600px, #e6e6e6 800px)',
                  }}
                >
                  <p className="m-0 text-sm">This review was posted on {review.platform}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review CTA */}
        <div className="text-center mt-10">
          <strong
            className="uppercase tracking-[1px] block"
            style={{ color: accentColor }}
          >
            Find Our Reviews Online:
          </strong>
          <div className="flex justify-center mt-[29px] flex-wrap gap-4">
            <Link
              href="/reviews"
              className="inline-flex items-center justify-center gap-2 min-w-[250px] px-4 py-[16px] text-white rounded-[44px] font-normal no-underline text-sm"
              style={{ backgroundColor: accentColor }}
              aria-label="View all reviews"
            >
              <span aria-hidden="true">→</span>
              Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
