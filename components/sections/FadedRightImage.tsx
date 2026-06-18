'use client'

import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function FadedRightImage({ headline, content, bullets, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const imgUrl = media && media.length ? buildMediaUrl(media[0], 800) : ''

  return (
    <div className="flex flex-col md:flex-row bg-[#f7f7f7]">
      {/* Left: content (order first on desktop) */}
      <div className="w-full md:w-7/12 flex items-center order-2 md:order-1">
        <div className="w-full px-4 md:px-[10%] py-8 md:py-10">
          {headline && (
            <h2
              className="text-[28px] md:text-[40px] mb-3 font-bold uppercase leading-[1.2] text-black"
              dangerouslySetInnerHTML={{ __html: headline }}
            />
          )}
          {content && (
            <span
              className="block text-base text-black"
              dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
          )}
          {bulletList.length > 0 && (
            <ul className="p-2 pl-6">
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
            className="w-full mt-3 py-4 text-white font-bold rounded block"
            style={{ backgroundColor: accentColor }}
            aria-label={cta}
          >
            <p className="text-[18px] md:text-[30px] font-bold capitalize mb-0">{cta}</p>
            <span className="text-[10px] md:text-base font-bold">Beginner classes enrolling right now!</span>
          </button>
        </div>
      </div>

      {/* Right: faded image (order-first on mobile) */}
      <div className="w-full md:w-5/12 p-0 order-1 md:order-2">
        <div
          className="w-full h-[300px] md:h-[650px] bg-cover bg-center"
          style={{
            backgroundImage: imgUrl
              ? `linear-gradient(to left, transparent 80%, #f7f7f7 100%), url('${imgUrl}')`
              : undefined,
          }}
        />
      </div>
    </div>
  )
}
