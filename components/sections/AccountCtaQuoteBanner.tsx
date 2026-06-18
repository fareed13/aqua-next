'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function AccountCtaQuoteBanner({ headline }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'

  return (
    <div className="py-7 px-4" style={{ background: 'var(--org-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Headline */}
          <div className="flex-1 sm:flex-[2]">
            {headline && (
              <h3 className="text-center text-white text-2xl font-bold m-0">
                {headline}
              </h3>
            )}
          </div>
          {/* CTA button */}
          <div className="flex-1 text-center">
            <button
              onClick={() => setDialog(true)}
              className="inline-flex items-center gap-2 bg-white font-semibold px-7 py-4 rounded"
              style={{ color: 'var(--org-primary)' }}
              aria-label={cta}
            >
              {cta}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
