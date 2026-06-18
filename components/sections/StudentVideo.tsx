'use client'

import Image from 'next/image'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function StudentVideo({ headline, subtitle, media }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  const imgs = Array.isArray(media) ? media : []
  const firstMedia = imgs.length > 0 ? imgs[0] : null
  const isVideo = firstMedia && (firstMedia as any).type === 'video'
  const mediaUrl = firstMedia ? buildMediaUrl(firstMedia) : ''

  return (
    <div className="bg-[#171d29] py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left caption card */}
          <div className="md:w-5/12">
            <div className="h-auto rounded-[10px] bg-[#d5242c] px-9 py-16 md:h-[450px]">
              <h3 className="mt-10 text-[26px] font-extrabold leading-tight text-white md:text-[36px]">
                {headline}
              </h3>
              <button
                onClick={() => setDialog(true)}
                className="mt-10 flex h-[60px] w-[190px] items-center justify-center gap-2 bg-[#171d29] text-white"
                aria-label="Read more"
              >
                Read More &rarr;
              </button>
            </div>
          </div>

          {/* Right video/image */}
          <div className="md:w-7/12">
            <div className="mb-2.5 flex justify-end">
              {subtitle && (
                <span className="text-base font-bold text-white md:text-[22px]">
                  {subtitle}
                </span>
              )}
            </div>
            <div className="relative w-full md:right-[12.5%] md:w-[750px]">
              {isVideo ? (
                <video
                  src={mediaUrl}
                  className="w-full rounded"
                  controls
                  aria-label={headline || 'Video content'}
                />
              ) : mediaUrl ? (
                <Image
                  src={mediaUrl}
                  alt={headline || 'Video thumbnail'}
                  width={750}
                  height={450}
                  className="w-full rounded object-cover"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
