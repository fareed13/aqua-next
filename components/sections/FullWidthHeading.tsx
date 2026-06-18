'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

export function FullWidthHeading({ headline, subtitle }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  return (
    <div
      className="w-full text-center text-white py-6 px-0"
      style={{ backgroundColor: accentColor }}
    >
      <div className="max-w-7xl mx-auto px-4 break-words">
        {headline && (
          <h2 className="text-[32px] md:text-[40px] leading-[1.1] font-bold" style={{ textShadow: '0 0 2px #777' }}>
            {headline}
          </h2>
        )}
        {subtitle && (
          <h4 className="text-[20px] md:text-[30px] font-bold mt-4" style={{ textShadow: '0 0 2px #777' }}>
            {subtitle}
          </h4>
        )}
      </div>
    </div>
  )
}
