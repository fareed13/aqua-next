'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl, buildBackgroundUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function ReviewsSplash({ headline, media, backgroundImage }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'rgba(213,36,44,0.8)'
  const accentDark = organization?.colors?.['app-main-accent-dark'] ?? '#000'
  const allReviews = organization?.org_reviews ?? []
  const reviews = allReviews.slice(0, 6)

  const isVideo = (ext?: string) => ext === 'webm' || ext === 'mp4'
  const isImg = (ext?: string) => ext === 'png' || ext === 'jpg' || ext === 'jpeg'

  // Resolve background URL — prefer backgroundImage prop, then media[0], then fallback
  let bgUrl = '/assets/img/landingPage/parentssying-bg.png'
  if (backgroundImage) {
    bgUrl = buildBackgroundUrl(backgroundImage)
  } else if (media && media.length > 0) {
    bgUrl = buildMediaUrl(media[0], 'x-large')
  }

  return (
    <div className="saying relative w-full text-center">
      <div className="relative w-full" style={{ backgroundColor: accentColor }}>
        {/* Background image */}
        {bgUrl && (
          <Image
            src={bgUrl}
            alt={headline || 'Reviews background image'}
            fill
            className="object-cover object-[top_right]"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            priority={false}
          />
        )}

        {/* Decorative top wave */}
        <div className="absolute top-0 left-0 w-full pointer-events-none" style={{ zIndex: 2 }}>
          <Image
            src="/assets/img/landingPage/program-offer-img2.png"
            alt="Decorative image"
            width={1900}
            height={102}
            className="w-full h-auto object-contain object-top"
            style={{ maxHeight: 300 }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-12" style={{ zIndex: 10 }}>
          {headline && (
            <h2
              className="text-white text-center"
              style={{ fontSize: 36, marginTop: 90, marginBottom: 25 }}
            >
              {headline}
            </h2>
          )}

          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review: any, i: number) => (
                <div key={i} className="mb-10">
                  {review.media && isVideo(review.media.extension) && (
                    <div
                      className="mb-4 relative"
                      style={{ boxShadow: `-10px -10px 0 ${accentDark}`, zIndex: 1 }}
                    >
                      <video
                        src={buildMediaUrl(review.media)}
                        controls
                        className="w-full"
                        aria-label={`Video testimonial from ${review.name}`}
                      />
                    </div>
                  )}
                  {review.media && isImg(review.media.extension) && (
                    <div className="mb-4 w-full">
                      <Image
                        src={buildMediaUrl(review.media)}
                        alt={review.media.name || review.name}
                        width={600}
                        height={400}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  <p className="text-white text-left">
                    {review.content} - {review.name} - {review.date_created}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1904px) { .saying h2 { margin-top: 200px; } }
        @media (max-width: 767px) { .saying h2 { margin-top: 20px; font-size: 28px; } }
        @media (max-width: 400px) { .saying h2 { font-size: 24px; } }
      `}</style>
    </div>
  )
}
