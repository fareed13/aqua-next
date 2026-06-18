'use client'

import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function CarouselVideo({ media }: SectionProps) {
  const currentMonth = MONTHS[new Date().getMonth()]

  const videoUrl = media && media.length > 0
    ? buildMediaUrl(media[0], 800)
    : ''

  return (
    <div
      className="relative w-full bg-black overflow-hidden"
      style={{ height: '80vh', maxHeight: '80vh' }}
    >
      {/* Background video */}
      {videoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-[1]"
          aria-label="Background video"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Dark overlay + content */}
      <div className="absolute inset-0 z-[5] bg-black/40 flex items-center justify-center flex-col text-center px-4">
        <h1 className="text-white text-2xl md:text-[60px] font-bold leading-none">
          Beginner Classes Enrolling In {currentMonth}!
        </h1>
      </div>
    </div>
  )
}
