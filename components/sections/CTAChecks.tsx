'use client'

import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { CheckCircle } from 'lucide-react'
import type { SectionProps } from '@/components/sections/registry'

const DEFAULT_BULLETS = [
  'Simple drag and drop webpage editor!',
  'Quickly build sales funnels that convert!',
  'Smart shopping cart with 1 click upsells!',
  'Email and Facebook Marketing Automation!',
  'Everything organized in one simple dashboard!',
]

export function CTAChecks({ bullets, headline, content }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)

  const accentDark = (org as any)?.colors?.['app-main-accent-dark'] || 'var(--org-primary-dark, var(--org-primary))'
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'
  const cta = loc?.call_to_action || 'Start Free 14 Day Trial Now'

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : DEFAULT_BULLETS

  return (
    <div className="py-10 mb-12" style={{ backgroundColor: accentDark }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 flex flex-col justify-center text-center">
            {headline && (
              <h2 className="my-0 text-white text-[40px] capitalize" dangerouslySetInnerHTML={{ __html: headline }} />
            )}
            {!headline && (
              <h2 className="my-0 text-white text-[40px] capitalize">Try Our Free Trial:</h2>
            )}
            <button
              onClick={() => setDialog(true)}
              className="block w-full text-white mt-3 py-5 px-4 rounded"
              style={{ backgroundColor: accentColor }}
              aria-label={cta}
            >
              <p className="text-[30px] font-bold capitalize mb-0 leading-none">{cta}</p>
              <span className="text-base">Start Building Your First Funnel Right Now!</span>
            </button>
            {content && (
              <p className="text-white mt-3 text-lg" dangerouslySetInnerHTML={{ __html: content }} />
            )}
            {!content && (
              <p className="text-white mt-3 text-lg">No obligations, no contracts, cancel at any time.</p>
            )}
          </div>

          <div className="md:w-1/2 flex flex-col justify-center">
            <ul className="list-none p-0 m-0">
              {bulletList.map((item, i) => (
                <li key={i} className="flex items-center gap-3 mb-3">
                  <CheckCircle className="shrink-0 text-white" size={30} />
                  <span
                    className="text-white text-[22px] leading-normal"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white text-lg py-3 px-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
            We Give You THE TOOLS You Need To Market, Sell and Deliver Your Products Online!
          </p>
        </div>
      </div>
    </div>
  )
}
