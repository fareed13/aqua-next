'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { LeftToRightArrow } from './LeftToRightArrow'

export function GeneralLeftImage({ headline, content, bullets, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || '#d5242c'
  const accentDark = (org as any)?.colors?.['app-main-accent-dark'] || '#9e0007'
  const services = (org as any)?.services ?? []
  const callToAction = (loc as any)?.call_to_action || (org as any)?.call_to_action || 'Secure Your Spot!'
  const urgencyHeadline = services[0]?.urgency_headline || 'Beginner classes enrolling right now!'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const isVideo = media && media.length ? media[0].type === 'video' : false
  const mediaUrl = media && media.length ? buildMediaUrl(media[0], 'medium') : ''

  return (
    <div style={{ marginBottom: 30 }}>
      <div className="relative overflow-hidden bg-white py-12 px-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: image/video */}
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
                  <ul style={{ margin: '20px 0', paddingLeft: 20 }}>
                    {bulletList.map((bullet, i) => (
                      <li key={i} className="flex items-center" style={{ listStyleType: 'none' }}>
                        {/* mdi:arrow-right-thick equivalent */}
                        <svg
                          viewBox="0 0 24 24"
                          width="25"
                          height="25"
                          fill="currentColor"
                          className="shrink-0 -ml-6 mr-1"
                        >
                          <path d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42.39.39 1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41l-6.58-6.6c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1z" />
                        </svg>
                        <span dangerouslySetInnerHTML={{ __html: bullet }} />
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => setDialog(true)}
                  className="w-full mt-3 mb-3 py-4 text-white font-bold block"
                  style={{ backgroundColor: accentColor, borderRadius: 5 }}
                  aria-label={callToAction}
                >
                  <p className="text-[18px] md:text-[30px] font-bold capitalize mb-0" style={{ fontFamily: 'Khand', letterSpacing: 2 }}>
                    {callToAction}
                  </p>
                  <span className="text-[10px] md:text-base font-bold">
                    {urgencyHeadline}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LeftToRightArrow />
    </div>
  )
}
