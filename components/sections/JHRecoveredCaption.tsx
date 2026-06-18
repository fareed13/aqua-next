'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JHRecoveredCaption({ media, customBullets, content, bullets }: SectionProps) {
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''
  const cBullets = Array.isArray(customBullets) ? customBullets : []
  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="pr-0 md:pr-[5%]">
        {imgUrl && (
          <div className="mb-5">
            <Image
              src={imgUrl}
              alt={cBullets.length > 0 ? (cBullets[0] as any).headline || 'Recovered caption image' : 'Recovered caption image'}
              width={900}
              height={500}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {cBullets.map((bullet: any, i: number) => (
          <div key={i}>
            <h4 className="mb-2.5 text-2xl font-normal text-[#232222]">{bullet.headline}</h4>
            <p className="mb-5 text-[15px]">{bullet.content}</p>
          </div>
        ))}

        {bulletList.length > 0 && (
          <ul className="mb-5 w-full list-none p-0">
            {bulletList.map((bullet: any, i: number) => (
              <li key={i} className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00a11a] text-white text-sm">
                  &rsaquo;
                </span>
                <span dangerouslySetInnerHTML={{ __html: bullet }} />
              </li>
            ))}
          </ul>
        )}

        {content && (
          <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
        )}
      </div>
    </div>
  )
}
