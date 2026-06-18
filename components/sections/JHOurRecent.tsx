'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JHOurRecent({ headline, media }: SectionProps) {
  const imgs = Array.isArray(media) ? media : []

  return (
    <div className="pt-24 pb-8">
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="mb-5 text-center text-[40px] font-normal uppercase tracking-wide text-[#333]">
          {headline}
        </h3>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Main large image */}
          {imgs.length > 0 && (
            <div className="md:w-1/2">
              <Image
                src={buildMediaUrl(imgs[0])}
                alt={headline || 'Recent work image'}
                width={700}
                height={480}
                className="h-[330px] w-full object-cover md:h-[480px]"
              />
            </div>
          )}

          {/* Grid of smaller images */}
          {imgs.length > 1 && (
            <div className="md:w-1/2">
              {imgs[1] && (
                <Image
                  src={buildMediaUrl(imgs[1])}
                  alt={headline || 'Recent work image'}
                  width={700}
                  height={240}
                  className="mb-3 h-auto w-full object-cover"
                />
              )}
              {imgs.length > 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {imgs[2] && (
                    <Image
                      src={buildMediaUrl(imgs[2])}
                      alt={headline || 'Recent work image'}
                      width={340}
                      height={220}
                      className="h-auto w-full object-cover"
                    />
                  )}
                  {imgs[3] && (
                    <Image
                      src={buildMediaUrl(imgs[3])}
                      alt={headline || 'Recent work image'}
                      width={340}
                      height={220}
                      className="h-auto w-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 mb-8 text-center">
          <a
            href="/classes"
            className="inline-flex w-[190px] items-center justify-center rounded-full bg-[#00a11a] py-2.5 text-white no-underline"
            aria-label="View all classes"
          >
            View All
          </a>
        </div>
      </div>
    </div>
  )
}
