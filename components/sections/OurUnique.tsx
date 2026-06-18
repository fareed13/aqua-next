'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function OurUnique({ headline, subtitle, customBullets, media }: SectionProps) {
  const bullets = Array.isArray(customBullets) ? customBullets : []
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0], 800) : ''

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left image */}
      <div className="relative h-64 w-full md:h-auto md:w-1/2">
        {imgUrl && (
          <Image
            src={imgUrl}
            alt={headline || 'Unique features image'}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Right content */}
      <div className="w-full bg-[#20232a] px-5 py-10 md:w-1/2 md:px-12">
        <div className="mt-5">
          <strong className="flex items-center gap-2.5 text-lg uppercase text-white">
            <span className="inline-block h-px w-[50px] border border-current" />
            {headline}
          </strong>
          <h3
            className="mt-2.5 mb-5 max-w-[325px] text-2xl font-black italic uppercase leading-[31px]"
            style={{ color: 'var(--org-primary)' }}
          >
            {subtitle}
          </h3>
        </div>

        {bullets.length > 0 && (
          <ul className="list-none p-0">
            {bullets.map((bullet: any, i: number) => (
              <li key={i} className="flex gap-4 py-4 pl-0">
                <strong
                  className="mt-0 shrink-0 text-xl font-black"
                  style={{ color: 'var(--org-primary)' }}
                >
                  {i + 1}.
                </strong>
                <div>
                  <h3
                    className="text-base uppercase text-white"
                    style={{ color: 'var(--org-primary)' }}
                  >
                    {bullet.headline}
                  </h3>
                  <p className="mt-3 text-xl font-light leading-[26px] text-[#8d8d8d]">
                    {bullet.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
