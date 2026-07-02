'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function BookNow({ headline, content, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const setDialog = useUiStore(s => s.setDialog)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'
  const imgUrl = media && media.length ? buildMediaUrl(media[0], 'large') : ''

  return (
    <div className="py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: caption */}
          <div className="w-full md:w-1/2">
            <div className="mt-12 md:mt-12">
              {headline && (
                <h3 className="text-[30px] md:text-[48px] font-extrabold leading-[52px] text-[#171d29]">
                  {headline}
                </h3>
              )}
              <div
                className="h-[2px] mt-2 mb-0"
                style={{ backgroundColor: accentColor }}
              />
              {content && (
                <div
                  className="mt-[70px]"
                  dangerouslySetInnerHTML={{ __html: content ?? '' }}
                />
              )}
              <button
                onClick={() => setDialog(true)}
                className="mt-8 h-[65px] w-[200px] text-white font-bold text-xl rounded flex items-center justify-center gap-2"
                style={{ backgroundColor: accentColor }}
                aria-label="Book now"
              >
                Book Now
                <span>&#8594;</span>
              </button>
            </div>
          </div>

          {/* Right: image */}
          <div className="w-full md:w-1/2">
            {imgUrl && (
              <div className="relative max-h-[500px] overflow-hidden">
                <Image
                  src={imgUrl}
                  alt={headline || 'Feature image'}
                  width={800}
                  height={500}
                  className="w-full object-contain max-h-[500px]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
