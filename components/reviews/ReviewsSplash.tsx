'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import type { Media } from '@/types/api'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function ReviewsSplash({ headline, media, backgroundImage }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const reviews = organization?.org_reviews ?? []

  const isVideo = (ext?: string) => ext === 'webm' || ext === 'mp4'
  const isImage = (ext?: string) => ext === 'png' || ext === 'jpg' || ext === 'jpeg'

  // Resolve background image URL
  let bgUrl = '/assets/img/landingPage/parentssying-bg.png'
  if (backgroundImage) {
    bgUrl = backgroundImage
  } else if (media && media.length > 0) {
    bgUrl = buildMediaUrl(media[0], 1200)
  }

  return (
    <div className="saying relative w-full text-center">
      <div
        className="relative w-full"
        style={{ backgroundColor: 'var(--org-primary)' }}
      >
        {/* Background image */}
        <div className="absolute inset-0 z-[1]">
          <Image
            src={bgUrl}
            alt={headline || 'Reviews background image'}
            fill
            className="object-cover object-[top_right]"
            priority={false}
          />
        </div>

        {/* Decorative top wave image */}
        <div className="absolute top-0 left-0 w-full z-[2] pointer-events-none">
          <Image
            src="/assets/img/landingPage/program-offer-img2.png"
            alt="Decorative image"
            width={1900}
            height={102}
            className="w-full h-auto max-h-[300px] object-contain object-top md:max-h-[102px]"
          />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-16">
          {headline && (
            <h2 className="text-white text-2xl md:text-4xl font-bold mb-6 mt-6 md:mt-[90px]">
              {headline}
            </h2>
          )}

          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review: any, i: number) => (
                <div key={i} className="mb-10">
                  {review.media && isVideo(review.media.extension) && (
                    <div
                      className="mb-4 z-[1] relative"
                      style={{ boxShadow: '-10px -10px 0 var(--org-primary-dark)' }}
                    >
                      <video
                        src={buildMediaUrl(review.media)}
                        controls
                        className="w-full"
                        aria-label={`Video testimonial from ${review.name}`}
                      />
                    </div>
                  )}
                  {review.media && isImage(review.media.extension) && (
                    <div className="mb-4 relative w-full aspect-video">
                      <Image
                        src={buildMediaUrl(review.media)}
                        alt={review.media.name || review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-white text-sm md:text-base">
                    {review.content} - {review.name} - {review.date_created}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
