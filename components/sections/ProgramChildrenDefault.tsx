'use client'

import { useProgramChildrenBlocks } from '@/hooks/useProgramChildrenBlocks'
import type { SectionProps } from '@/components/sections/registry'

export function ProgramChildrenDefault({ headline, subtitle, plan }: SectionProps) {
  const { childrenServices } = useProgramChildrenBlocks({ headline, subtitle, service_id: plan ?? null })

  if (!childrenServices.length) return null

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {headline && (
          <h2 className="text-center my-5 text-[40px] font-bold" style={{ fontFamily: 'Khand, sans-serif' }}>
            {headline}
          </h2>
        )}
        <div className="flex flex-wrap justify-around gap-4">
          {childrenServices.map((service, i) => (
            <div key={i} className="w-full sm:w-[45%] md:w-[30%] rounded-[10px] p-[20px_20px_30px] text-center h-full" style={{ backgroundColor: 'var(--org-primary-dark, var(--org-primary))' }}>
              <h4
                className="text-white text-[36px] leading-none font-extrabold"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                {subtitle} {service.min_age} to {service.max_age}
              </h4>
              <h3 className="text-[#c2e2f5] text-[60px] leading-none">{service.name}</h3>
              <p className="text-white text-lg leading-none pt-5">{service.short_description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
