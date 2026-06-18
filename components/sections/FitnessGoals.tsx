'use client'

import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

export function FitnessGoals({ headline, content, customBullets }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  return (
    <div className="py-[70px] px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          {headline && (
            <h3 className="text-[33px] md:text-[56px] leading-[44px] md:leading-[64px] tracking-wide uppercase text-center font-extrabold text-[#111111] mb-5 max-w-[550px] mx-auto">
              {headline}
            </h3>
          )}
          {content && (
            <div
              className="text-center text-base text-[#777777] leading-[31px] max-w-[700px] mx-auto"
              dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
          )}
        </div>

        {/* Goal cards */}
        {customBullets && customBullets.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {customBullets.map((bullet: any, i: number) => (
              <div key={i} className="text-center w-full sm:w-1/2 md:w-1/4 px-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mx-auto mb-5"
                  style={{ width: 40, height: 40, fill: accentColor }}
                >
                  <path d="M2,20c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8H2V20z M4,10h16v10H4V10z M15,2v2H9V2H7v2H6C4.9,4,4,4.9,4,6v2h16V6c0-1.1-0.9-2-2-2h-1V2H15z" />
                </svg>
                {bullet.headline && (
                  <h4 className="text-[#111111] text-base md:text-[18px] uppercase font-extrabold mb-2 leading-7">
                    {bullet.headline}
                  </h4>
                )}
                {bullet.content && (
                  <p className="text-[#777777] text-sm">{bullet.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
