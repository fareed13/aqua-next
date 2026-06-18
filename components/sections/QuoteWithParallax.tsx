'use client'

import type { SectionProps } from '@/components/sections/registry'

export function QuoteWithParallax({ headline, backgroundImage }: SectionProps) {
  const bgUrl = backgroundImage
    ? (() => {
        const parts = backgroundImage.split('.')
        return `${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${parts[0]}_1200.${parts[1]}`
      })()
    : ''

  return (
    <div
      className="relative min-h-[400px] w-full"
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/70" />

      <div className="relative z-10 flex min-h-[400px] items-center justify-center px-4 py-12 md:px-8">
        <h2 className="w-full text-center text-[1.75rem] font-black uppercase tracking-wide text-white md:text-[3rem] lg:text-[4rem]">
          {headline}
        </h2>
      </div>
    </div>
  )
}
