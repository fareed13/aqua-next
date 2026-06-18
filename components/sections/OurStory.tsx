'use client'

import Image from 'next/image'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

export function OurStory({ headline, subtitle, content, media }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)
  const loc = useOrgStore(s => s.location)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0], 350) : ''

  return (
    <div className="relative bg-[#181a1f] pb-0 pt-[50px] md:pt-[140px]">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-5 mt-5">
          <strong className="flex items-center gap-2.5 text-lg uppercase text-white">
            <span className="inline-block h-px w-[50px] border border-current" />
            Our story
          </strong>
          <h3
            className="mb-5 text-[33px] uppercase"
            style={{ color: 'var(--org-primary)' }}
          >
            {headline}
          </h3>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-8/12">
            <h5 className="text-lg text-white">{subtitle}</h5>
            {content && (
              <div
                className="mt-6 text-sm leading-relaxed text-white"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}
            <button
              onClick={() => setDialog(true)}
              className="mt-8 border px-8 py-2.5 text-sm"
              style={{
                borderColor: 'var(--org-primary)',
                color: 'var(--org-primary)',
                borderRadius: 0,
              }}
              aria-label={cta}
            >
              {cta}
            </button>
          </div>

          <div className="md:w-4/12">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={headline || 'Our story image'}
                width={400}
                height={500}
                className="mt-8 h-auto w-full object-cover md:mt-0"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
