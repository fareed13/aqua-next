'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function GeneralLeftImage({ headline, content, bullets, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'
  const accentDark = (org as any)?.colors?.['app-main-accent-dark'] || 'var(--org-primary-dark)'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const isVideo = media && media.length ? media[0].type === 'video' : false
  const mediaUrl = media && media.length ? buildMediaUrl(media[0], 350) : ''

  return (
    <div className="mb-8 mt-4">
      <div className="relative overflow-hidden bg-white py-12 px-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: image */}
            <div className="w-full md:w-5/12 flex flex-col justify-center pr-0 md:pr-7">
              {mediaUrl && (
                isVideo ? (
                  <video
                    src={mediaUrl}
                    className="w-full"
                    style={{ boxShadow: `-15px -15px 0 ${accentDark}`, zIndex: 1, position: 'relative' }}
                    controls
                  />
                ) : (
                  <Image
                    src={mediaUrl}
                    alt={headline || 'Section image'}
                    width={700}
                    height={500}
                    className="w-full"
                    style={{ boxShadow: `-15px -15px 0 ${accentDark}`, zIndex: 1, position: 'relative' }}
                  />
                )
              )}
            </div>

            {/* Right: content */}
            <div className="w-full md:w-7/12 flex flex-col justify-center pl-0 md:pl-7">
              <div>
                {headline && (
                  <h2
                    className="text-[28px] md:text-[40px] my-3 font-bold"
                    dangerouslySetInnerHTML={{ __html: headline }}
                  />
                )}
                {content && (
                  <span
                    className="block text-base [&_p]:mb-4 [&_ul]:pl-8"
                    dangerouslySetInnerHTML={{ __html: content ?? '' }}
                  />
                )}
                {bulletList.length > 0 && (
                  <ul className="my-5 pl-5">
                    {bulletList.map((bullet, i) => (
                      <li key={i} className="flex items-center mb-1 list-none">
                        <span className="mr-2 font-bold text-xl">&#8250;&#8250;</span>
                        <span dangerouslySetInnerHTML={{ __html: bullet }} />
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setDialog(true)}
                  className="w-full mt-3 mb-3 py-4 text-white font-bold rounded block animate-[rocking_2s_infinite]"
                  style={{ backgroundColor: accentColor }}
                  aria-label={cta}
                >
                  <p className="text-[18px] md:text-[30px] font-bold capitalize mb-0">{cta}</p>
                  <span className="text-[10px] md:text-base font-bold">
                    Beginner classes enrolling right now!
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
