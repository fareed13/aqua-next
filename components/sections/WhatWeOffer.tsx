'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function WhatWeOffer({ headline, content, bullets, media }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0], 800) : ''

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left image */}
      <div className="relative h-64 w-full md:h-auto md:w-1/2">
        {imgUrl && (
          <Image
            src={imgUrl}
            alt={(media?.[0] as any)?.alternativeText || headline || 'What we offer'}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Right content */}
      <div className="w-full px-4 py-16 md:w-1/2 md:px-12 md:pr-[215px] lg:pr-[215px]">
        <h3 className="text-[40px] font-extrabold uppercase leading-tight tracking-wide text-[#111111] md:text-[56px] md:leading-[64px]">
          {headline}
        </h3>
        {content && (
          <div
            className="mt-0 text-base leading-[31px] text-[#777777]"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        )}
        {bulletList.length > 0 && (
          <ul className="mt-2 list-none p-0">
            {bulletList.map((bullet: any, i: number) => (
              <li key={i} className="flex min-h-[35px] items-center gap-2 py-0 pl-0">
                <span className="text-[22px] text-[#d5242c]">&#10003;</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => setDialog(true)}
          className="relative mt-10 inline-flex h-[50px] items-center pl-[75px] pr-6 text-white before:absolute before:left-5 before:h-px before:w-8 before:bg-white"
          style={{ backgroundColor: 'var(--org-primary)', borderRadius: 0 }}
          aria-label={cta}
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
