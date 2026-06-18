'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useUiStore } from '@/store/uiStore'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function CarouselSix({ headline, subtitle }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)
  const location = useOrgStore(s => s.location)

  // Use location reviews/services or fall back to empty
  // Services come from orgStore; we use media from location if available
  const services = (location as any)?.services ?? []
  const items = services.slice(0, 6).map((s: any, i: number) => ({
    src: s?.large_media
      ? buildMediaUrl(s.large_media, 1200)
      : '',
    alt: `Service image ${i + 1}`,
  }))

  // Fill with placeholders if fewer than 6
  while (items.length < 6) {
    items.push({ src: '', alt: `Service image ${items.length + 1}` })
  }

  return (
    <div className="w-full">
      <div className="relative">
        {/* 6-image grid */}
        <div className="grid grid-cols-3">
          {items.map((item: { src: string; alt: string }, i: number) => (
            <div key={i} className="relative h-[300px] md:h-[400px] overflow-hidden">
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  priority={i < 3}
                />
              ) : (
                <div className="w-full h-full bg-gray-400" />
              )}
            </div>
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center">
          {subtitle && (
            <h3 className="text-[#cccccc] text-center text-base md:text-2xl mb-2">
              {subtitle}
            </h3>
          )}
          {headline && (
            <h2 className="text-white text-center text-2xl md:text-[60px] leading-[1.1] mb-6 px-4">
              {headline}
            </h2>
          )}
          <button
            onClick={() => setDialog(true)}
            className="text-white bg-[#d5242c] px-6 py-3 text-sm md:text-[22px] font-medium hover:bg-[#b51e24] transition"
            aria-label="Request more information"
          >
            Request More Information
          </button>
        </div>
      </div>
    </div>
  )
}
