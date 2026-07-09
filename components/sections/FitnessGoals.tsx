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
        <div className="mb-8">
          {headline && (
            <h3 className="text-[33px] md:text-[56px] leading-[44px] md:leading-[64px] tracking-wide uppercase text-center font-semibold text-[#111111] mb-5 max-w-[550px] mx-auto">
              {headline}
            </h3>
          )}
          {content && (
            <div
              className="text-base text-[#777777] leading-[31px] max-w-[700px] mx-auto"
              dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
          )}
        </div>

        {/* Goal cards — left-aligned (justify-start) to match Nuxt's v-row
            default: a single card sits on the left, not centered. No flex gap;
            each card's padding is the Vuetify gutter so exactly 4 fit per row
            at md, and -m-3 pulls the outer edges flush with the container. */}
        {customBullets && customBullets.length > 0 && (
          <div className="flex flex-wrap justify-start mt-10 -m-3">
            {customBullets.map((bullet: any, i: number) => (
              <div key={i} className="text-center w-full md:w-1/4 p-3">
                {/* mdi:waves — matches Nuxt's <Icon name="mdi:waves" /> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mx-auto mb-5"
                  style={{ width: 40, height: 40, fill: accentColor }}
                >
                  <path d="M20,12C18.61,12 17.22,11.5 16,10.67C13.56,12.33 10.44,12.33 8,10.67C6.78,11.5 5.39,12 4,12H2V10H4C5.39,10 6.78,9.35 8,8.5C10.44,10.17 13.56,10.17 16,8.5C17.22,9.35 18.61,10 20,10H22V12H20M20,6C18.61,6 17.22,5.5 16,4.67C13.56,6.33 10.44,6.33 8,4.67C6.78,5.5 5.39,6 4,6H2V4H4C5.39,4 6.78,3.35 8,2.5C10.44,4.17 13.56,4.17 16,2.5C17.22,3.35 18.61,4 20,4H22V6H20M20,18C18.61,18 17.22,17.5 16,16.67C13.56,18.33 10.44,18.33 8,16.67C6.78,17.5 5.39,18 4,18H2V16H4C5.39,16 6.78,15.35 8,14.5C10.44,16.17 13.56,16.17 16,14.5C17.22,15.35 18.61,16 20,16H22V18H20Z" />
                </svg>
                {bullet.headline && (
                  <h4 className="text-[#111111] text-[18px] md:text-[13px] lg:text-[18px] uppercase font-extrabold mb-2.5 leading-7">
                    {bullet.headline}
                  </h4>
                )}
                {bullet.content && (
                  <p className="text-[#777777] text-[14px] md:text-[12px] lg:text-[14px]">{bullet.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
