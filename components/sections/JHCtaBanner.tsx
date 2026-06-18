'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JHCtaBanner({ headline, media }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const imgUrl = media && media.length > 0 && (media[0] as any).type === 'image'
    ? buildMediaUrl(media[0])
    : ''

  return (
    <div className="relative h-[140px] w-full overflow-hidden md:h-[180px]">
      {imgUrl && (
        <Image
          src={imgUrl}
          alt={headline || 'CTA banner image'}
          fill
          className="object-cover"
        />
      )}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2.5 px-5 text-center md:flex-row md:gap-8">
        {headline && (
          <h3 className="m-0 text-lg font-normal text-white md:text-3xl">
            {headline}
          </h3>
        )}
        {loc?.pretty_phone && (
          <a
            href={`tel:${loc.pretty_phone}`}
            className="flex items-center gap-1.5 rounded-full bg-[#00a11a] px-5 py-2 text-sm font-semibold text-black no-underline md:px-6 md:py-2.5"
            aria-label="Call us"
          >
            &#9990; {loc.pretty_phone}
          </a>
        )}
      </div>
    </div>
  )
}
