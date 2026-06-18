'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function SalonServices({ headline = "LET'S FIND THE RIGHT PROGRAM FOR YOU" }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const services = organization?.services ?? []
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)'

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  return (
    <div className="py-3 px-0">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section heading */}
        <div className="mb-5">
          <strong
            className="text-xl mb-1.5 block"
            style={{ color: accentColor }}
          >
            Salon Services
          </strong>
          <div className="flex items-baseline gap-2.5">
            <h3 className="uppercase text-[30px] md:text-[40px] font-normal">
              {headline}
            </h3>
            {/* waves icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 flex-shrink-0"
              viewBox="0 0 24 24"
              fill={accentColor}
              aria-hidden="true"
            >
              <path d="M2 12c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M2 7c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M2 17c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative flex items-center max-w-[1000px]">
          {/* Prev button */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="flex-shrink-0 w-[50px] h-[50px] border-2 bg-white flex items-center justify-center mr-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: accentColor, borderRadius: 0 }}
            aria-label="Previous service"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scroll-smooth gap-5 pb-2"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
          >
            {services.map((service) => {
              const imgUrl = service.large_media
                ? buildMediaUrl(service.large_media)
                : service.small_media
                ? buildMediaUrl(service.small_media)
                : null
              const slug = service.slug || service.id

              return (
                <div
                  key={service.id}
                  className="relative flex-shrink-0 w-[320px] md:w-[360px] h-[320px] mr-0"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  {/* Image */}
                  <div className="overflow-hidden w-full h-[260px]">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={service.name || 'Service image'}
                        width={360}
                        height={200}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  {/* Caption */}
                  <div className="relative px-5 pt-4 pb-3 bg-white group">
                    <h3 className="text-[#222222] text-[22px] font-normal group-hover:text-white relative z-10 transition-colors duration-200">
                      {service.name}
                    </h3>
                    {/* Hover background fill */}
                    <div className="absolute inset-0 bg-[#222222] h-0 group-hover:h-[60px] transition-all duration-300" aria-hidden="true" />
                    {/* Arrow link */}
                    <Link
                      href={`/classes/${slug}/`}
                      aria-label={`View ${service.name} service`}
                      className="absolute right-10 -top-6 flex items-center justify-center w-[42px] h-[42px] z-10"
                      style={{ backgroundColor: accentColor, borderRadius: 0 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="flex-shrink-0 w-[50px] h-[50px] border-2 bg-white flex items-center justify-center ml-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: accentColor, borderRadius: 0 }}
            aria-label="Next service"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
