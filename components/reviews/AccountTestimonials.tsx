'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function AccountTestimonials({ countOfReviews }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const allReviews = organization?.org_reviews ?? []
  const reviews = countOfReviews ? allReviews.slice(0, countOfReviews) : allReviews

  const isVideo = (ext?: string) => ext === 'mp4' || ext === 'webm'

  const getStars = (rating: any): number[] => {
    if (!rating) return []
    const count = parseInt(String(rating), 10)
    return isNaN(count) ? [] : Array.from({ length: count }, (_, i) => i)
  }

  return (
    <div className="bg-white py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <h4
            className="text-[20px] flex items-center justify-center gap-2 max-w-[195px] mx-auto"
            style={{ color: 'var(--org-primary)' }}
          >
            <span className="flex-1 border-t border-current mt-3" />
            Testimonials
            <span className="flex-1 border-t border-current mt-3" />
          </h4>
          <h2 className="text-center text-[43px] mt-1 text-[#212529] font-bold">
            What Clients Say About Us
          </h2>
        </div>

        {/* Desktop: horizontal scroll */}
        {reviews.length > 0 && (
          <div className="overflow-x-auto snap-x snap-mandatory flex gap-0 pb-4">
            {reviews.map((review: any, i: number) => {
              const stars = getStars(review.rating)
              const hasImageMedia = review.media && !isVideo(review.media.extension)

              return (
                <div
                  key={i}
                  className="snap-center shrink-0 bg-white shadow-[2px_4px_18px_rgba(204,204,204,0.51)] text-center max-w-[320px] mx-[22px] my-[30px] p-[30px]"
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
                      style={{ color: 'var(--org-primary)' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                  )}

                  <h4 className="font-semibold text-base mb-1">{review.name}</h4>

                  <p className="text-[#adb5bd] text-sm mt-2 overflow-hidden text-ellipsis line-clamp-3">
                    {review.content}
                  </p>

                  {/* Star rating */}
                  <div className="mt-6 flex justify-center gap-0.5">
                    {stars.map((_, si) => (
                      <span
                        key={si}
                        className="text-[19px]"
                        style={{ color: 'var(--org-primary)' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!reviews.length && (
          <p className="text-center text-gray-400">No testimonials yet.</p>
        )}
      </div>
    </div>
  )
}
