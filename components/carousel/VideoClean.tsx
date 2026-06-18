'use client'

import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

export function VideoClean({ headline, subtitle, media }: SectionProps) {
  const hasVideo = media && media.length > 0 && media[0].type === 'video'
  const videoUrl = hasVideo ? buildMediaUrl(media![0], 800) : ''

  return (
    <div className="w-full bg-[#f6f6f8] py-8 px-4">
      <div className="mt-5">
        {headline && (
          <h2
            className="uppercase text-center text-[50px] md:text-[80px] font-bold mb-2"
            dangerouslySetInnerHTML={{ __html: headline ?? '' }}
          />
        )}
        {subtitle && (
          <h4 className="text-center text-[30px] md:text-[42px] text-[#bf2a2a] italic leading-none mb-4">
            {subtitle}
          </h4>
        )}

        {hasVideo && videoUrl && (
          <div className="max-w-[700px] mx-auto my-8">
            <video
              src={videoUrl}
              controls
              className="w-full h-auto"
              style={{ maxHeight: '400px' }}
              aria-label={headline || 'Video content'}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    </div>
  )
}
