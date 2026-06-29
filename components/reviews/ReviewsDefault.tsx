'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function ReviewsDefault({ countOfReviews }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const accentDark = organization?.colors?.['app-main-accent-dark'] ?? '#000'
  const allReviews = organization?.org_reviews ?? []
  const reviews = allReviews.slice(0, countOfReviews ?? 6)

  if (!reviews.length) return null

  const isVideo = (ext?: string) => ext === 'webm' || ext === 'mp4'
  const isImg = (ext?: string) => ext === 'png' || ext === 'jpg' || ext === 'jpeg'

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 text-center">
        {reviews.map((review: any, i: number) => (
          <div key={i} className="my-2 py-10 px-10 flex flex-col justify-center">
            {review.media && isVideo(review.media.extension) && (
              <div style={{ boxShadow: `-10px -10px 0 ${accentDark}`, zIndex: 1 }}>
                <video
                  src={buildMediaUrl(review.media)}
                  controls
                  className="w-full"
                  aria-label={`Video testimonial from ${review.name}`}
                />
              </div>
            )}
            {review.media && isImg(review.media.extension) && (
              <div className="w-full mb-2">
                <Image
                  src={buildMediaUrl(review.media)}
                  alt={review.media.name || review.name || 'Review image'}
                  width={400}
                  height={300}
                  className="w-full h-auto"
                />
              </div>
            )}
            <p className="text-left">
              {review.content} - {review.name} - {review.date_created}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
