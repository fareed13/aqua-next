'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function AbbiLeftImage({ headline, content, bullets, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const setDialog = useUiStore(s => s.setDialog)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || '#575cec'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const imgUrl = media && media.length ? buildMediaUrl(media[0]) : ''

  return (
    <div className="relative min-h-[520px] overflow-hidden py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left: organic SVG clipped image */}
          <div className="w-full md:w-5/12 lg:w-5/12 flex justify-center">
            <div className="w-full max-w-[520px]">
              <svg
                className="w-full h-auto"
                width="550"
                height="552"
                viewBox="0 0 760 802"
              >
                <defs>
                  <clipPath id="clip-path-abbi-left">
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
                    clipPath="url(#clip-path-abbi-left)"
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
          </div>

          {/* Right: content */}
          <div className="w-full md:w-7/12 lg:w-7/12 flex flex-col justify-center items-center">
            <div className="w-full max-w-2xl">
              {headline && (
                <h2
                  className="text-[20px] md:text-[36px] font-bold leading-[1.108] mb-2 mt-8 md:mt-24"
                  dangerouslySetInnerHTML={{ __html: headline }}
                />
              )}
              {content && (
                <div
                  className="text-black text-lg md:text-2xl leading-relaxed font-bold mt-4"
                  dangerouslySetInnerHTML={{ __html: content ?? '' }}
                />
              )}
              {bulletList.length > 0 && (
                <ul className="pl-4 mt-2">
                  {bulletList.map((bullet, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: bullet }} />
                  ))}
                </ul>
              )}
              <button
                onClick={() => setDialog(true)}
                className="mt-3 px-6 py-3 rounded-full text-white font-bold text-lg w-[280px] text-center"
                style={{ background: accentColor }}
                aria-label="Secure your spot"
              >
                Secure your spot!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
