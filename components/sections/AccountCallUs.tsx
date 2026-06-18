'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

export function AccountCallUs({ headline, subtitle, content, media }: SectionProps) {
  const imgUrl = media && media.length ? buildMediaUrl(media[0]) : ''

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left: image */}
      <div className="w-full md:w-[45%] relative" style={{ minHeight: 300 }}>
        {imgUrl && (
          <Image
            src={imgUrl}
            alt="Call us image"
            fill
            style={{ objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Right: caption */}
      <div className="w-full md:w-[55%] bg-[#273e53] px-8 py-16 md:px-24">
        <div className="mb-10">
          {headline && (
            <h4
              className="text-left text-xl font-medium mb-1"
              style={{ color: 'var(--org-primary)' }}
            >
              {headline}
            </h4>
          )}
          {subtitle && (
            <h2 className="text-left text-3xl md:text-[43px] text-white leading-[60px] mb-4">
              {subtitle}
            </h2>
          )}
          <hr
            className="my-3 ml-0 mr-2 border-t-2 border-b-2"
            style={{ maxWidth: 50, borderColor: 'var(--org-primary)', marginBottom: 50 }}
          />
          {content && (
            <div
              className="text-[#868e96]"
              dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
