'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'
import type { Media } from '@/types/api'

export function LandingPageBanner({ headline: header, backgroundImage: background }: SectionProps) {
  const org = useOrgStore((s) => s.organization)

  // Derive a stable image src:
  // 1. Use org shared inner_page_media if available
  // 2. Otherwise pick a service image using a deterministic hash of header
  let src = ''

  const innerPageMedia = org?.shared?.inner_page_media as Media | undefined
  if (innerPageMedia?.name && innerPageMedia?.extension) {
    src = buildMediaUrl(innerPageMedia, 1200)
  } else {
    // Fallback: use background prop directly if it's a URL
    if (background) {
      src = background
    }
  }

  return (
    <div className="home-slider landing-page-banner relative w-full overflow-hidden" style={{ minHeight: '400px' }}>
      {/* Background image */}
      {src && (
        <Image
          src={src}
          alt={header || 'Page banner'}
          fill
          className="object-cover object-center"
          priority
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-24 md:py-32 px-4">
        <div className="my-[6rem]">
          <h1 className="text-white text-[30px] md:text-[48px] pb-0 mb-0">
            {header}
          </h1>
        </div>
      </div>
    </div>
  )
}
