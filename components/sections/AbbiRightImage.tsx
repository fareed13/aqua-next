'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useUiStore } from '@/store/uiStore'

export function AbbiRightImage({ headline, content, bullets, media }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const imgUrl = media && media.length ? buildMediaUrl(media[0], 'x-large') : ''

  return (
    <div className="relative min-h-[520px] overflow-hidden py-8 bg-[#f7f7f7]">
      {/* Absolutely positioned SVG image on the right */}
      <div className="hidden md:block absolute right-0 top-0 w-[520px] max-w-[40%]">
        <svg
          className="w-full h-auto"
          width="550"
          height="552"
          viewBox="0 0 760 802"
        >
          <defs>
            <clipPath id="clip-path-abbi-right">
              <path d="M378,765s124.616-40.066,310-190c0,0,68.856-60.088,32-190,0,0-54.991-180.651-167-291,0,0-31.641-41.4-125-53S123.382,83.884,65,179C5.59,275.791,16.11,355.17,20,381c0,0,13.547,176.712,128,301S316.588,777.645,378,765Z" />
            </clipPath>
          </defs>
          <path
            fillRule="evenodd"
            fill="#f5f5f5"
            d="M378,765s124.616-40.066,310-190c0,0,68.856-60.088,32-190,0,0-54.991-180.651-167-291,0,0-31.641-41.4-125-53S123.382,83.884,65,179C5.59,275.791,16.11,355.17,20,381c0,0,13.547,176.712,128,301S316.588,777.645,378,765Z"
          />
          {imgUrl && (
            <foreignObject
              y="50"
              x="0"
              width="673"
              height="843"
              clipPath="url(#clip-path-abbi-right)"
            >
              <Image
                src={imgUrl}
                alt={headline || 'Section image'}
                width={673}
                height={843}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </foreignObject>
          )}
        </svg>
      </div>

      {/* Mobile image */}
      {imgUrl && (
        <div className="md:hidden w-full max-w-[520px] mx-auto overflow-hidden">
          <svg className="w-full h-auto" width="550" height="552" viewBox="0 0 760 802">
            <defs>
              <clipPath id="clip-path-abbi-right-mob">
                <path d="M378,765s124.616-40.066,310-190c0,0,68.856-60.088,32-190,0,0-54.991-180.651-167-291,0,0-31.641-41.4-125-53S123.382,83.884,65,179C5.59,275.791,16.11,355.17,20,381c0,0,13.547,176.712,128,301S316.588,777.645,378,765Z" />
              </clipPath>
            </defs>
            <path fillRule="evenodd" fill="#f5f5f5" d="M378,765s124.616-40.066,310-190c0,0,68.856-60.088,32-190,0,0-54.991-180.651-167-291,0,0-31.641-41.4-125-53S123.382,83.884,65,179C5.59,275.791,16.11,355.17,20,381c0,0,13.547,176.712,128,301S316.588,777.645,378,765Z" />
            <foreignObject y="50" x="0" width="673" height="843" clipPath="url(#clip-path-abbi-right-mob)">
              <Image src={imgUrl} alt={headline || 'Section image'} width={673} height={843} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </foreignObject>
          </svg>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-7/12 lg:w-7/12">
            {headline && (
              <h2
                className="text-[20px] md:text-[36px] font-bold leading-[1.108] mt-8 md:mt-24 mb-2"
                dangerouslySetInnerHTML={{ __html: headline }}
              />
            )}
            {content && (
              <div
                className="text-black text-lg md:text-2xl leading-relaxed font-bold mt-4 ml-0 md:ml-7"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}
            {bulletList.length > 0 && (
              <ul className="ml-0 md:ml-10 mt-2">
                {bulletList.map((bullet, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: bullet }} />
                ))}
              </ul>
            )}
          </div>
          <div className="hidden md:block md:w-5/12 lg:w-4/12" />
        </div>
      </div>
    </div>
  )
}
