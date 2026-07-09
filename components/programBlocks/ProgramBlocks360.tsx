'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function ProgramBlocks360({ headline = "LET'S FIND THE RIGHT PROGRAM FOR YOU" }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const services = organization?.services ?? []

  // Match Nuxt: only root services (no parent) that have a large_media image.
  // There is no hard "9" cap — that's just how many qualify for this org.
  const programs = services.filter(
    (s: any) => s.parent_service === null && s.large_media?.uuid,
  )

  const accent = organization?.colors?.['app-main-accent-with-transparent'] ?? 'rgba(244,202,89,0.8)'

  // Track hover state per card
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div className="relative bg-white pt-10 pb-16 overflow-hidden z-[5]">
      {/* Decorative diagonal background band */}
      <div
        className="absolute pointer-events-none z-[-1]"
        style={{
          width: '400px',
          top: '-100%',
          right: 0,
          left: '-50%',
          bottom: '-100%',
          margin: '0 auto',
          background: 'rgba(158,93,17,0.302)',
          transform: 'rotate(-37.3deg)',
        }}
        aria-hidden="true"
      />

      {/* Heading */}
      {headline && (
        <h2
          className="text-center uppercase font-bold text-lg md:text-4xl mb-8 mx-2.5"
          style={{ fontFamily: 'Khand, sans-serif', color: '#f4ca59' }}
        >
          {headline}
        </h2>
      )}

      {/* Grid — justify-center to match Nuxt's <v-row no-gutters justify="center"> */}
      <div className="flex flex-wrap justify-center">
        {programs.map((service: any) => {
          const imgUrl = buildMediaUrl(service.large_media, 700)
          const slug = service.slug || service.id
          const isHovering = hoveredId === service.id

          return (
            <div
              key={service.id}
              className="w-full sm:w-1/2 md:w-1/3 px-1 mb-2"
            >
              <div
                className="relative cursor-pointer overflow-hidden"
                style={{ borderRadius: 0 }}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden min-h-[400px] md:min-h-[500px]" style={{ aspectRatio: '1.25' }}>
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={service.name || 'Program image'}
                      fill
                      className="object-cover w-full h-full block"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-300" />
                  )}

                  {/* Default overlay bar (name only, bottom strip) — fades out on hover */}
                  <div
                    className="absolute left-0 right-0 bottom-0 h-[50px] md:h-[76px] flex items-center justify-center transition-opacity duration-200"
                    style={{
                      background: accent,
                      fontFamily: 'Khand, sans-serif',
                      fontWeight: 'bold',
                      opacity: isHovering ? 0 : 1,
                    }}
                  >
                    <span className="uppercase text-black text-base md:text-2xl lg:text-[30px] text-center px-4">
                      {service.name}
                    </span>
                  </div>

                  {/* Hover overlay (full height) — always mounted so it can
                      slide up (scaleY) like Nuxt's <transition name="slide-up">. */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center text-center"
                    style={{
                      background: 'rgba(25,27,24,0.8)',
                      fontFamily: 'Khand, sans-serif',
                      fontWeight: 'bold',
                      color: accent,
                      transformOrigin: 'bottom',
                      transform: isHovering ? 'scaleY(1)' : 'scaleY(0)',
                      opacity: isHovering ? 1 : 0,
                      transition: isHovering
                        ? 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)'
                        : 'opacity 0.2s ease-out',
                      pointerEvents: isHovering ? 'auto' : 'none',
                    }}
                  >
                    <span className="uppercase text-base md:text-2xl lg:text-[30px] mb-4 px-4">
                      {service.name}
                    </span>
                    <Link
                      href={`/classes/${slug}/`}
                      className="uppercase border border-white text-white text-base font-bold px-[25px] py-3 hover:bg-white hover:text-black transition-colors"
                      style={{ borderRadius: 0, fontFamily: 'Khand, sans-serif' }}
                      aria-label={`Learn more about ${service.name}`}
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
