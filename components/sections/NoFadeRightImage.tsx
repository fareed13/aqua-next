'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function NoFadeRightImage({ headline, content, bullets, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentDark = (org as any)?.colors?.['app-main-accent-dark'] || 'var(--org-primary-dark, var(--org-primary))'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const imgUrl = media?.length ? buildMediaUrl(media[0], 800) : ''

  return (
    <div
      className="relative overflow-hidden bg-[#f7f7f7]"
      style={{
        backgroundImage: imgUrl ? `url('${imgUrl}')` : undefined,
        backgroundPosition: 'top right',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          {/* Mobile image */}
          {imgUrl && (
            <div className="md:hidden text-center py-4">
              <Image src={imgUrl} alt={headline || 'Section image'} width={400} height={300} className="mx-auto" />
            </div>
          )}

          {/* Content — left col, 2/3 width on desktop */}
          <div className="md:w-2/3 py-12 md:py-[50px]">
            <div
              className="relative"
              style={{
                background: '#f7f7f7',
                boxShadow: '15px -4px 63px 77px #f7f7f7',
              }}
            >
              {headline && (
                <h2
                  className="mb-3 text-[35px] text-black uppercase leading-[1.2] font-bold"
                  dangerouslySetInnerHTML={{ __html: headline }}
                />
              )}
              {content && (
                <span
                  className="block text-base text-black"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
              {bulletList.length > 0 && (
                <h5 className="mb-3 text-lg" style={{ color: accentDark }}>
                  <ul className="list-none p-0">
                    {bulletList.map((bullet, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: bullet }} />
                    ))}
                  </ul>
                </h5>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
