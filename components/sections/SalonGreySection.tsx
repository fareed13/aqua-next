'use client'

import type { SectionProps } from '@/components/sections/registry'

export function SalonGreySection({ headline, subtitle, content, backgroundImage }: SectionProps) {
  const bgUrl = backgroundImage
    ? `${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${backgroundImage}`
    : ''

  return (
    <div
      className="flex min-h-[400px] items-center justify-end pr-5 md:min-h-[550px] md:pr-[100px]"
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-full pt-0 text-right md:max-w-[550px] md:pt-[70px]">
        <h4 className="mb-2.5 text-[28px] text-white md:text-[33px]">{headline}</h4>
        <h3 className="mb-5 text-[32px] text-white md:text-[44px]">{subtitle}</h3>
        {content && (
          <div
            className="text-right text-white"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        )}
      </div>
    </div>
  )
}
