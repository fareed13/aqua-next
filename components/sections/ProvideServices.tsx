'use client'

import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import type { SectionProps } from '@/components/sections/registry'

export function ProvideServices({ headline, content }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)

  return (
    <div className="bg-[#111111] py-16 px-4 text-center md:py-[130px]">
      <div className="mx-auto max-w-6xl px-4 md:px-[10em]">
        {/* Play icon */}
        <button
          className="mb-16 inline-flex h-[75px] w-[75px] items-center justify-center text-white"
          style={{ backgroundColor: 'var(--org-primary)' }}
          aria-label="Play video"
        >
          &#9654;
        </button>

        <h3 className="text-[31px] font-extrabold uppercase leading-[43px] text-white md:text-[56px] md:leading-[64px]">
          {headline}
        </h3>

        {content && (
          <div
            className="mt-4 mb-6 text-sm text-white md:text-base"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        )}

        <div className="mt-16 flex flex-col items-center gap-3 md:flex-row md:justify-center">
          <button
            onClick={() => setDialog(true)}
            className="relative h-[50px] w-full pl-[85px] pr-6 text-white before:absolute before:left-5 before:top-[24px] before:h-px before:w-8 before:bg-white md:w-auto"
            style={{ backgroundColor: 'var(--org-primary)', borderRadius: 0 }}
            aria-label="Book a class"
          >
            Book A Class
          </button>

          <a
            href={`tel:${loc?.pretty_phone ?? ''}`}
            className="flex h-[50px] w-full items-center justify-center gap-5 bg-white px-8 text-sm no-underline md:w-auto"
            style={{ color: 'var(--org-primary)', borderRadius: 0 }}
            aria-label="Call us"
          >
            <span
              className="inline-block h-px w-10"
              style={{ backgroundColor: 'var(--org-primary)' }}
            />
            CallUs : {loc?.pretty_phone}
          </a>
        </div>
      </div>
    </div>
  )
}
