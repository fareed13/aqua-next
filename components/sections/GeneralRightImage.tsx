'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function GeneralRightImage({ headline, content, bullets, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'
  const accentDark = (org as any)?.colors?.['app-main-accent-dark'] || 'var(--org-primary-dark)'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const isVideo = media && media.length ? media[0].type === 'video' : false
  const mediaUrl = media && media.length ? buildMediaUrl(media[0], 350) : ''

  // Strip HTML to check if content is truly empty
  const hasContent = (() => {
    if (!content) return false
    const stripped = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
    return stripped.length > 0
  })()
  const hasNonEmptyBullets = bulletList.some(b => b && b.trim() !== '')
  const hasAnyContent = hasContent || hasNonEmptyBullets || !!headline

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden bg-white py-12 px-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center gap-6">
            {/* Left: content */}
            {hasAnyContent && (
              <div className="w-full md:w-7/12 flex flex-col justify-center pr-0 md:pr-7">
                <div>
                  {headline && (
                    <h2
                      className="text-[28px] md:text-[40px] my-3 font-bold"
                      dangerouslySetInnerHTML={{ __html: headline }}
                    />
                  )}
                  {content && (
                    <span
                      className="block text-base [&_p]:mb-4 [&_ul]:ml-[5%]"
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
                    className="w-full mt-3 mb-2 py-4 text-white font-bold rounded block"
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
            )}

            {/* Right: image */}
            <div className="w-full md:w-5/12 flex flex-col justify-center pl-0 md:pl-7">
              {mediaUrl && (
                isVideo ? (
                  <video
                    src={mediaUrl}
                    className="w-full relative z-[2]"
                    style={{ boxShadow: `-15px -15px 0 ${accentDark}` }}
                    controls
                  />
                ) : (
                  <Image
                    src={mediaUrl}
                    alt={headline || 'Section image'}
                    width={700}
                    height={500}
                    className="w-full relative z-[2]"
                    style={{ boxShadow: `-15px -15px 0 ${accentDark}` }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
