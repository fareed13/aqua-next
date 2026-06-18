'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function OurClientServices({ headline, subtitle, media }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const reviews: any[] = (loc as any)?.reviews ?? []
  const [currentSlide, setCurrentSlide] = useState(0)

  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  const canGoPrev = currentSlide > 0
  const canGoNext = currentSlide < reviews.length - 1

  return (
    <div className="flex flex-col md:flex-row">
      {/* Left reviews */}
      <div className="w-full px-6 py-12 text-center md:w-1/2 md:px-[100px]">
        <h3 className="mb-3 text-[27px] font-extrabold uppercase leading-tight tracking-wide text-[#111111] md:text-[56px] md:leading-[64px]">
          {headline}
        </h3>
        <p className="mb-10 text-base text-[#777777]">{subtitle}</p>

        {reviews.length > 0 && (
          <>
            {(() => {
              const rev = reviews[currentSlide]
              const dateStr = rev.date_created
                ? `${MONTHS[parseInt(rev.date_created.substring(5, 7)) - 1]} ${rev.date_created.substring(8, 10)}`
                : ''
              return (
                <div className="text-left">
                  <div className="mb-3 flex items-center gap-5">
                    <div className="h-9 w-10 shrink-0">
                      {/* star icon placeholder */}
                      <span className="text-[#e31c25]">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-extrabold uppercase tracking-wide text-[#111111]">
                        {rev.name}
                      </h4>
                      <span className="text-sm font-normal uppercase tracking-wide text-[#e31c25]">
                        {dateStr}
                      </span>
                    </div>
                  </div>
                  <p className="mt-5 mb-2.5 text-base italic leading-[31px] text-[#777777]">
                    {rev.content}
                  </p>
                  {rev.rating && (
                    <div className="flex gap-0.5 text-[25px] text-[#e31c25]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}

            {reviews.length > 1 && (
              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  onClick={() => canGoPrev && setCurrentSlide(s => s - 1)}
                  disabled={!canGoPrev}
                  aria-label="Previous review"
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111] bg-[#1111]/10 transition hover:bg-[#111]/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  &lsaquo;
                </button>
                <button
                  onClick={() => canGoNext && setCurrentSlide(s => s + 1)}
                  disabled={!canGoNext}
                  aria-label="Next review"
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#111] bg-[#111]/10 transition hover:bg-[#111]/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  &rsaquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right image */}
      <div className="w-full md:w-1/2">
        {imgUrl && (
          <Image
            src={imgUrl}
            alt={headline || 'Client services image'}
            width={800}
            height={600}
            className="h-full w-full object-cover pt-10"
          />
        )}
      </div>
    </div>
  )
}
