'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function BuyNow({ headline, content, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const setDialog = useUiStore(s => s.setDialog)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'
  const industryType = (org as any)?.industry_type || ''
  const isFitness = industryType === 'fitness_center'
  const btnLabel = isFitness ? 'Buy Now' : 'Book Now'

  const imgUrl = media && media.length ? buildMediaUrl(media[0], 350) : ''
  const isVideo = media && media.length ? media[0].type === 'video' : false

  return (
    <div className="py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: caption */}
          <div className="w-full md:w-1/2">
            <div className="mt-12">
              {headline && (
                <h3 className="text-[30px] md:text-[48px] font-extrabold leading-[52px] text-[#171d29]">
                  {headline}
                </h3>
              )}
              <div
                className="h-[2px] mt-2 mb-0"
                style={{ borderColor: accentColor }}
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
                style={{ background: accentColor }}
                aria-label={btnLabel}
              >
                {btnLabel}
                <span>&#8594;</span>
              </button>
            </div>
          </div>

          {/* Right: media */}
          <div className="w-full md:w-1/2">
            {imgUrl && (
              isVideo ? (
                <video
                  src={imgUrl}
                  height={500}
                  className="w-full max-h-[500px] object-contain"
                />
              ) : (
                <Image
                  src={imgUrl}
                  alt={headline || 'Feature image'}
                  width={700}
                  height={500}
                  className="w-full max-h-[500px] object-contain"
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
