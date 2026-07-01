'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

const MONTHS = ['Jan.','Feb.','Mar.','Apr.','May','Jun.','Jul.','Aug.','Sept.','Oct.','Nov.','Dec.']

export function OurClientServices({ headline, subtitle, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const reviews: any[] = ((org as any)?.org_reviews ?? []).slice(0, 6)
  const [currentSlide, setCurrentSlide] = useState(0)

  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

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
            {/* Fixed-height carousel area — matches Nuxt v-carousel height: 265px */}
            <div className="relative h-[265px] overflow-hidden">
              {(() => {
                const rev = reviews[currentSlide]
                const dateStr = rev.date_created
                  ? `${MONTHS[parseInt(rev.date_created.substring(5, 7)) - 1]} ${rev.date_created.substring(8, 10)}`
                  : ''
                return (
                  <div className="text-left" style={{ marginTop: '12px' }}>
                    <div className="mb-3 flex items-center gap-5">
                      <img
                        src="/assets/img/start-likn.png"
                        width={40}
                        height={35}
                        alt="Star rating icon"
                        className="shrink-0 object-contain"
                      />
                      <div className="client-name-title">
                        <h4 className="text-2xl font-extrabold uppercase tracking-[1px] text-[#111111] leading-8">
                          {rev.name}
                        </h4>
                        <span className="text-sm font-normal uppercase tracking-[1px] text-[#e31c25]">
                          {dateStr}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <p className="mb-2.5 text-base italic leading-[31px] text-[#777777]">
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
                  </div>
                )
              })()}
            </div>

            {/* Dot indicators — matches Vuetify carousel delimiters */}
            {reviews.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Go to review ${i + 1}`}
                    className="h-2 w-2 rounded-full transition-all duration-200"
                    style={{ backgroundColor: i === currentSlide ? '#111111' : '#cccccc' }}
                  />
                ))}
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
