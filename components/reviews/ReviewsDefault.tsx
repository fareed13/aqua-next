'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function ReviewsDefault({ countOfReviews }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const allReviews = organization?.org_reviews ?? []
  const reviews = countOfReviews ? allReviews.slice(0, countOfReviews) : allReviews

  if (!reviews.length) return null

  const isVideo = (ext?: string) =>
    ext === 'webm' || ext === 'mp4'
  const isImage = (ext?: string) =>
    ext === 'png' || ext === 'jpg' || ext === 'jpeg'

  return (
    <div className="py-16 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-black capitalize mb-10">
          Hear what our members are saying
        </h2>

        {/* Desktop: 3-col grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {reviews.map((review: any, i: number) => (
            <ReviewCard key={i} review={review} isVideo={isVideo} isImage={isImage} />
          ))}
        </div>

        {/* Mobile: single-slide carousel */}
        <MobileCarousel reviews={reviews} isVideo={isVideo} isImage={isImage} />
      </div>
    </div>
  )
}

interface ReviewCardProps {
  review: any
  isVideo: (ext?: string) => boolean
  isImage: (ext?: string) => boolean
}

function ReviewCard({ review, isVideo, isImage }: ReviewCardProps) {
  const stars = review.rating ? Math.round(Number(review.rating)) : 0

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit' })
  }

  return (
    <div className="bg-[#eeeeee] border border-[#aaa] text-center p-5 min-h-[331px] flex flex-col items-center">
      {review.media && isVideo(review.media.extension) && (
        <div className="w-full mb-3" style={{ boxShadow: '-10px -10px 0 var(--org-primary-dark)' }}>
          <video
            src={buildMediaUrl(review.media)}
            controls
            className="w-full"
            aria-label={`Video testimonial from ${review.name}`}
          />
        </div>
      )}
      {review.media && isImage(review.media.extension) && (
        <div className="w-full mb-3 relative aspect-video">
          <Image
            src={buildMediaUrl(review.media)}
            alt={review.media.name || review.name || 'Review image'}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Stars */}
      <div className="flex justify-center gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, si) => (
          <span key={si} className={si < stars ? 'text-orange-400' : 'text-gray-300'} style={{ fontSize: 20 }}>
            ★
          </span>
        ))}
      </div>

      <p className="text-[#0e0e0e] text-sm line-clamp-5 whitespace-normal break-words mb-2 flex-1">
        {review.content}
      </p>

      <strong className="block mb-2 text-sm">{review.name}</strong>
      <h4 className="text-[#0e0e0e] text-sm mb-2">
        {formatDate(review.date_created || review.created_at)}
      </h4>
      <span className="block text-[#2783ef] text-2xl">&#9993;</span>
    </div>
  )
}

function MobileCarousel({ reviews, isVideo, isImage }: { reviews: any[]; isVideo: (ext?: string) => boolean; isImage: (ext?: string) => boolean }) {
  return (
    <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 pb-4">
      {reviews.map((review: any, i: number) => (
        <div
          key={i}
          className="snap-center shrink-0 w-[90vw] max-w-sm bg-[#eee] border border-[#aaa] text-center p-5 min-h-[331px] flex flex-col items-center"
        >
          {review.media && isVideo(review.media.extension) && (
            <div className="w-full mb-3">
              <video
                src={buildMediaUrl(review.media)}
                controls
                className="w-full"
                aria-label={`Video testimonial from ${review.name}`}
              />
            </div>
          )}
          {review.media && isImage(review.media.extension) && (
            <div className="w-full mb-3 relative aspect-video">
              <Image
                src={buildMediaUrl(review.media)}
                alt={review.media.name || review.name || 'Review image'}
                fill
                className="object-cover"
              />
            </div>
          )}
          <p className="text-[#0e0e0e] text-sm mb-2 flex-1">{review.content}</p>
          <strong className="block mb-1 text-sm">{review.name}</strong>
          <h4 className="text-sm text-[#0e0e0e]">
            {new Date(review.date_created || review.created_at).toLocaleDateString('en-US', { month: 'long', day: '2-digit' })}
          </h4>
          <span className="block text-[#2783ef] text-2xl mt-2">&#9993;</span>
        </div>
      ))}
    </div>
  )
}
