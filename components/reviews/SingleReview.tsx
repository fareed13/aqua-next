import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

export function SingleReview({ headline, content, subtitle, media }: SectionProps) {
  const imageUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Left: image */}
          <div className="sm:w-5/12">
            <div className="relative w-full aspect-square">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={headline || 'Review image'}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
          </div>

          {/* Right: content */}
          <div className="sm:w-7/12 flex flex-col justify-center">
            {headline && (
              <h2
                className="mb-5 text-[#00b4c7] font-light text-4xl md:text-[70px] leading-tight"
                dangerouslySetInnerHTML={{ __html: headline }}
              />
            )}
            {content && (
              <p className="text-3xl md:text-[36px] leading-snug mb-4 italic">
                {content}
              </p>
            )}
            {subtitle && (
              <h3 className="font-bold text-2xl italic">-{subtitle}</h3>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
