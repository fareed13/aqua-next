'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function AccountTestimonials({ countOfReviews }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-with-transparent'] ?? '#1d99b6'
  const allReviews = organization?.org_reviews ?? []
  const reviews = allReviews.slice(0, countOfReviews ?? 6)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const isVideo = (ext?: string) => ext === 'mp4' || ext === 'webm'

  const getStars = (rating: any): number[] => {
    if (!rating) return []
    const count = parseInt(String(rating), 10)
    return isNaN(count) ? [] : Array.from({ length: count }, (_, i) => i)
  }

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 370, behavior: 'smooth' })
  }

  return (
    <div className="bg-white py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <h4
            className="flex items-center justify-center max-w-[195px] mx-auto"
            style={{ fontSize: 20, color: accentColor }}
          >
            <span className="flex-1 border-t border-current mt-3 mr-2" />
            Testimonials
            <span className="flex-1 border-t border-current mt-3 ml-2" />
          </h4>
          <h2 className="text-center mt-1 font-bold" style={{ fontSize: 43, color: '#212529' }}>
            What Clients Say About Us
          </h2>
        </div>

        {/* Carousel with arrows */}
        {reviews.length > 0 && (
          <div className="relative">
            {/* Left arrow */}
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30"
              aria-label="Previous testimonial"
              style={{ fontSize: 22 }}
            >
              ‹
            </button>

            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="overflow-x-auto flex pb-4 hide-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {reviews.map((review: any, i: number) => {
                const stars = getStars(review.rating)
                const hasImageMedia = review.media && !isVideo(review.media.extension)

                return (
                  <div
                    key={i}
                    className="shrink-0 bg-white text-center"
                    style={{
                      boxShadow: '2px 4px 18px rgba(204,204,204,0.51)',
                      maxWidth: 320,
                      margin: '30px 22px',
                      padding: 30,
                      scrollSnapAlign: 'center',
                    }}
                  >
                    {/* Avatar */}
                    {hasImageMedia ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-5 bg-[#ccc]">
                        <Image
                          src={buildMediaUrl(review.media)}
                          alt={`${review.name} profile picture`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-gray-200"
                        style={{ color: accentColor }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                    )}

                    <h4 className="font-semibold text-base mb-1">{review.name}</h4>

                    <p
                      className="text-sm mt-2"
                      style={{
                        color: '#adb5bd',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical' as const,
                      }}
                    >
                      {review.content}
                    </p>

                    {/* Stars */}
                    <div className="mt-6 flex justify-center" style={{ gap: 4 }}>
                      {stars.map((_, si) => (
                        <span key={si} style={{ color: accentColor, fontSize: 19, margin: '0 2px' }}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30"
              aria-label="Next testimonial"
              style={{ fontSize: 22 }}
            >
              ›
            </button>
          </div>
        )}

        {!reviews.length && (
          <p className="text-center text-gray-400">No testimonials yet.</p>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
