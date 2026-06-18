'use client'

import type { SectionProps } from '@/components/sections/registry'
import type { Media } from '@/types/api'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function GymBanner({ subtitle, headline, backgroundImage }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = organization?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  const bgUrl = backgroundImage
    ? buildMediaUrl({ uuid: backgroundImage } as Media, 800)
    : ''

  return (
    <div className="gym-main-wrapper">
      <div
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Caption */}
        <div className="relative z-10 text-center px-4">
          {subtitle && (
            <p className="text-white uppercase text-2xl md:text-[40px] tracking-widest font-light mb-0">
              {subtitle}
            </p>
          )}
          {headline && (
            <h3 className="text-white uppercase text-2xl md:text-[40px] tracking-widest mb-5">
              {headline}
            </h3>
          )}
          <button
            onClick={() => setDialog(true)}
            style={{ backgroundColor: accentColor }}
            className="text-white px-7 py-6 rounded-none font-medium hover:opacity-90 transition flex items-center gap-1 mx-auto"
            aria-label={cta}
          >
            {cta}
            <span>&#8250;</span>
          </button>
        </div>
      </div>
    </div>
  )
}
