'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function BlockedRightImage({ headline, subtitle, content, bullets, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const imgUrl = media && media.length ? buildMediaUrl(media[0]) : ''
  const isVideo = media && media.length ? media[0].type === 'video' : false
  const accentDark = (org as any)?.colors?.['app-main-accent-dark'] || 'var(--org-primary-dark)'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  return (
    <div className="py-4 px-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="border border-[rgba(214,214,214,0.7)] p-5 pl-6 md:pl-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: text */}
            <div className="w-full md:w-7/12 xl:w-7/12 flex flex-col justify-center">
              {headline && (
                <h2
                  className="text-2xl md:text-[50px] font-bold leading-[1.1] mb-2"
                  dangerouslySetInnerHTML={{ __html: headline }}
                />
              )}
              {subtitle && (
                <h4
                  className="text-2xl md:text-[30px]"
                  dangerouslySetInnerHTML={{ __html: subtitle }}
                />
              )}
              <hr className="border-none border-t border-[#dcdcdc] max-w-[200px] w-full my-8 mx-auto" />
              {content && (
                <div
                  className="text-base"
                  dangerouslySetInnerHTML={{ __html: content ?? '' }}
                />
              )}
            </div>

            {/* Right: image + bullets */}
            <div className="w-full md:w-5/12 xl:w-5/12">
              {imgUrl && (
                <div
                  className="relative max-w-[700px] w-full mx-auto"
                  style={{ boxShadow: `-15px -15px 0 ${accentDark}`, zIndex: 1 }}
                >
                  {isVideo ? (
                    <video src={imgUrl} width={700} height={500} className="w-full object-contain" />
                  ) : (
                    <Image
                      src={imgUrl}
                      alt={headline || 'Section image'}
                      width={700}
                      height={500}
                      className="w-full object-contain"
                    />
                  )}
                </div>
              )}
              {bulletList.length > 0 && (
                <ul className="mt-5 ml-5">
                  {bulletList.map((bullet, i) => (
                    <li key={i} className="flex items-center mb-1">
                      <span className="mr-2 text-2xl font-bold">&#8250;</span>
                      <span dangerouslySetInnerHTML={{ __html: bullet }} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Full-width CTA button */}
          <button
            onClick={() => setDialog(true)}
            className="w-full mt-3 mb-3 py-5 text-white font-bold rounded text-center block"
            style={{ backgroundColor: accentColor }}
            aria-label="Secure your spot - Beginner classes enrolling right now"
          >
            <p className="text-xl md:text-[30px] font-bold capitalize mb-0">Secure your spot!</p>
            <span className="text-sm font-bold">Beginner classes enrolling right now!</span>
          </button>
        </div>
      </div>
    </div>
  )
}
