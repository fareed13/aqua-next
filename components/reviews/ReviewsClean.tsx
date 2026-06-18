'use client'

import { useState } from 'react'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

export function ReviewsClean({ countOfReviews }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const allReviews = organization?.org_reviews ?? []
  const reviews = countOfReviews ? allReviews.slice(0, countOfReviews) : allReviews

  const [activeSlide, setActiveSlide] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  if (!reviews.length) return null

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit' })
  }

  const socialIcon: Record<string, string> = {
    linkedin: '🔗',
    facebook: 'f',
    instagram: '📸',
    twitter: '𝕏',
    google: 'G',
    default: '✉',
  }

  const getSocialIcon = (platform?: string) =>
    platform ? (socialIcon[platform.toLowerCase()] ?? socialIcon.default) : socialIcon.default

  const toggleExpand = (i: number) => {
    setExpandedIndex(prev => (prev === i ? null : i))
  }

  return (
    <div className="py-16 pb-24">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="capitalize text-center text-2xl md:text-3xl font-bold text-black mb-10">
          Hear what our members are saying
        </h2>

        {/* Desktop horizontal scroll carousel */}
        <div className="hidden md:flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 items-center">
          {reviews.map((review: any, i: number) => {
            const stars = review.rating ? Math.round(Number(review.rating)) : 0
            const isExpanded = expandedIndex === i

            return (
              <div
                key={i}
                className="snap-center shrink-0 w-[267px] bg-[#eeeeee] border border-[#aaa] text-center p-5 min-h-[331px] flex flex-col items-center mx-6"
              >
                {/* Stars */}
                <div className="flex justify-center mb-2">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <span key={si} style={{ color: si < stars ? 'orange' : 'grey', fontSize: 25 }}>★</span>
                  ))}
                </div>

                <p className={`text-[#0e0e0e] text-[13px] whitespace-normal break-words mb-1 flex-1 ${isExpanded ? '' : 'line-clamp-5'}`}>
                  {review.content}
                </p>

                <button
                  onClick={() => toggleExpand(i)}
                  className="text-[9px] capitalize text-[#0e0e0e] underline mb-2 cursor-pointer"
                  aria-label={isExpanded ? 'Collapse review text' : 'Read more review text'}
                >
                  {isExpanded ? 'Collapse' : 'Read More'}
                </button>

                <strong className="block mb-2 text-sm">{review.name}</strong>
                <h4 className="text-[#0e0e0e] text-sm mb-3">
                  {formatDate(review.date_created || review.created_at)}
                </h4>
                <span className="block text-[#2783ef] text-2xl">{getSocialIcon(review.platform ?? undefined)}</span>
              </div>
            )
          })}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          {reviews.length > 0 && (
            <div className="relative">
              <div className="bg-[#eee] border border-[#aaa] text-center p-5 min-h-[331px] flex flex-col items-center">
                {(() => {
                  const review = reviews[activeSlide]
                  const stars = review.rating ? Math.round(Number(review.rating)) : 0
                  const isExpanded = expandedIndex === activeSlide
                  return (
                    <>
                      <div className="flex justify-center mb-2">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <span key={si} style={{ color: si < stars ? 'orange' : 'grey', fontSize: 20 }}>★</span>
                        ))}
                      </div>
                      <p className={`text-[#0e0e0e] text-sm mb-2 flex-1 ${isExpanded ? '' : 'line-clamp-5'}`}>
                        {review.content}
                      </p>
                      <button
                        onClick={() => toggleExpand(activeSlide)}
                        className="text-xs capitalize underline mb-2 mx-auto cursor-pointer"
                        style={{ width: 100 }}
                        aria-label={isExpanded ? 'Collapse review text' : 'Read more review text'}
                      >
                        {isExpanded ? 'Collapse' : 'Read More'}
                      </button>
                      <strong className="block mb-1 text-sm">{review.name}</strong>
                      <h4 className="text-sm text-[#0e0e0e] mb-3">
                        {formatDate(review.date_created || review.created_at)}
                      </h4>
                      <span className="block text-[#2783ef] text-2xl mb-4">{getSocialIcon(review.platform ?? undefined)}</span>
                    </>
                  )
                })()}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => { setActiveSlide(prev => Math.max(0, prev - 1)); setExpandedIndex(null) }}
                  disabled={activeSlide === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-40"
                  aria-label="Previous review"
                >
                  ‹
                </button>
                <span className="text-sm text-gray-500 self-center">{activeSlide + 1} / {reviews.length}</span>
                <button
                  onClick={() => { setActiveSlide(prev => Math.min(reviews.length - 1, prev + 1)); setExpandedIndex(null) }}
                  disabled={activeSlide === reviews.length - 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-40"
                  aria-label="Next review"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
