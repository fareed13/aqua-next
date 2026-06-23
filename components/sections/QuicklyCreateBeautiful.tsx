'use client'

import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import type { SectionProps } from '@/components/sections/registry'

export function QuicklyCreateBeautiful({ headline, content }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)

  const accentDark = (org as any)?.colors?.['app-main-accent-dark'] || 'var(--org-primary-dark, var(--org-primary))'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'
  const cta = loc?.call_to_action || 'Start Free 14 Day Trial Now'

  return (
    <div className="py-10 mb-12 relative overflow-hidden" style={{ backgroundColor: accentDark }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-5/12 flex flex-col justify-center text-center">
            <h3 className="text-white text-[36px]">
              {headline ? <span dangerouslySetInnerHTML={{ __html: headline }} /> : '"Quickly Create Beautiful'}
            </h3>
            <h2 className="my-0 text-white text-[70px] capitalize leading-tight">Sales Funnels</h2>
            <p className="text-white text-[24px]">
              {content
                ? <span dangerouslySetInnerHTML={{ __html: content }} />
                : 'That Convert Your Visitors Into Leads And Then Customers...'}
            </p>
            <p className="text-white italic">(Without Having To Hire or Rely On A Tech Team!)</p>
            <button
              onClick={() => setDialog(true)}
              className="block w-full text-white mt-3 py-5 px-4 rounded"
              style={{ backgroundColor: accentColor }}
              aria-label={cta}
            >
              <p className="text-[30px] font-bold capitalize mb-0 leading-none">{cta}</p>
              <span className="text-base">Start Building Your First Funnel Right Now!</span>
            </button>
          </div>

          <div className="md:w-7/12 flex flex-col justify-center">
            <iframe
              width="100%"
              src="https://www.youtube.com/embed/2Eesbo_x544"
              frameBorder={0}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Sales funnel video"
              className="shadow-xl"
              style={{ height: 350 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
