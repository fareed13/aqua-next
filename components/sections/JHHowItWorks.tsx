'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JHHowItWorks({ headline, content, media, customBullets, backgroundImage }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const bullets = Array.isArray(customBullets) ? customBullets : []
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  const bgStyle = backgroundImage
    ? { backgroundImage: `url(${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${backgroundImage})`, backgroundSize: '100% 100%' }
    : undefined

  return (
    <div className="pb-10" style={bgStyle}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left text */}
          <div className="md:w-1/2">
            <div className="pt-8">
              <h3 className="mb-2.5 text-[32px] font-normal uppercase tracking-wide text-black md:text-[38px]">
                {headline}
              </h3>
              {content && (
                <div
                  className="mb-8 text-[17px] text-[#606060]"
                  dangerouslySetInnerHTML={{ __html: content ?? '' }}
                />
              )}
              {loc?.pretty_phone && (
                <div className="w-2/5 md:w-[40%]">
                  <a
                    href={`tel:${loc.pretty_phone}`}
                    className="flex items-center gap-2.5 rounded-full bg-[#00a11a] px-4 py-2.5 text-black no-underline"
                    aria-label={`Call ${loc.pretty_phone}`}
                  >
                    &#9990; {loc.pretty_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right image */}
          <div className="mt-5 md:w-1/2">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={headline || 'How it works image'}
                width={600}
                height={400}
                className="h-auto w-full"
              />
            )}
          </div>
        </div>

        {/* How it works steps */}
        {bullets.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-10 text-center text-[40px] font-normal tracking-wide text-black">
              How It works
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {bullets.map((bullet: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="min-h-[240px] flex items-center justify-center">
                    {bullet.media && (
                      <Image
                        src={buildMediaUrl(bullet.media)}
                        alt={bullet.headline || 'How it works step'}
                        width={320}
                        height={238}
                        className="mx-auto object-contain"
                      />
                    )}
                  </div>
                  <h4 className="mx-auto max-w-[200px] pt-5 text-center text-base">
                    {bullet.headline}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
