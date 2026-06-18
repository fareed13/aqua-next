'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Media } from '@/types/api'

export function JHWavyBottomRightImage({
  subtitle,
  headline,
  content,
  media,
  backgroundImage,
}: SectionProps) {
  const bgUrl = backgroundImage
    ? buildMediaUrl({ uuid: backgroundImage } as Media, 800)
    : ''

  const rightMedia = media && media.length > 0 ? media[0] : null
  const rightMediaUrl = rightMedia ? buildMediaUrl(rightMedia, 800) : ''

  return (
    <div
      className="relative w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundSize: '100% 100%', backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row py-20 md:pt-[100px] gap-6">
          {/* Left content */}
          <div className="w-full md:w-8/12">
            {subtitle && (
              <strong className="text-white text-[15px] md:text-[30px] uppercase tracking-wider font-light">
                {subtitle}
              </strong>
            )}
            {headline && (
              <h3 className="text-white text-2xl md:text-[50px] uppercase tracking-wider font-medium leading-[48px] mt-2">
                {headline}
              </h3>
            )}
            {content && (
              <div
                className="text-white text-[16px] md:text-[26px] font-light leading-[29px] mt-5"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}
          </div>

          {/* Right media */}
          {rightMedia && rightMediaUrl && (
            <div className="w-full md:w-4/12 relative">
              <Image
                src={rightMediaUrl}
                alt={headline || 'Banner image'}
                width={400}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* Wavy bottom shape */}
      <div className="relative top-[30px]">
        <svg viewBox="0 0 1440 320" className="w-full" aria-hidden="true">
          <path
            fill="#fff"
            fillOpacity="1"
            d="M0,288L26.7,261.3C53.3,235,107,181,160,133.3C213.3,85,267,43,320,32C373.3,21,427,43,480,90.7C533.3,139,587,213,640,245.3C693.3,277,747,267,800,224C853.3,181,907,107,960,106.7C1013.3,107,1067,181,1120,186.7C1173.3,192,1227,128,1280,112C1333.3,96,1387,128,1413,144L1440,160L1440,320L1413.3,320C1386.7,320,1333,320,1280,320C1226.7,320,1173,320,1120,320C1066.7,320,1013,320,960,320C906.7,320,853,320,800,320C746.7,320,693,320,640,320C586.7,320,533,320,480,320C426.7,320,373,320,320,320C266.7,320,213,320,160,320C106.7,320,53,320,27,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  )
}
