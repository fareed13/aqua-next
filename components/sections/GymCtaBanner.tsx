'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function GymCtaBanner({ headline, subtitle, content }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  return (
    <div className="bg-[#00669f] py-4 pb-2 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Title */}
          <div className="w-full md:w-2/12">
            {subtitle && (
              <span className="font-normal text-white uppercase">{subtitle}</span>
            )}
            {headline && (
              <h3 className="font-black uppercase text-white text-2xl mb-0">{headline}</h3>
            )}
          </div>

          {/* Content */}
          <div className="w-full md:w-6/12">
            {content && (
              <div
                className="text-white text-lg md:text-[18px] border-l-[3px] border-[#c1946d] pl-9 [&_p]:m-0"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}
          </div>

          {/* CTA button */}
          <div className="w-full md:w-4/12 text-center">
            <button
              onClick={() => setDialog(true)}
              className="px-6 py-3 text-white font-bold"
              style={{ backgroundColor: accentColor }}
              aria-label={cta}
            >
              {cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
