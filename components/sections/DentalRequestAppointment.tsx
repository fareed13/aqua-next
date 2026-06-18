'use client'

import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import type { SectionProps } from '@/components/sections/registry'

export function DentalRequestAppointment({ headline, content }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'

  return (
    <div className="py-15">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-[750px] text-center">
          <h3 className="text-2xl leading-tight md:text-[34px] md:leading-[41px]">
            {headline}
          </h3>
        </div>
        {content && (
          <div
            className="mx-auto mt-10 max-w-[900px] text-center"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        )}
        <div className="mt-7 flex justify-center">
          <button
            onClick={() => setDialog(true)}
            className="rounded-full px-7 py-2.5 text-sm tracking-widest text-white"
            style={{ backgroundColor: 'var(--org-primary)' }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  )
}
