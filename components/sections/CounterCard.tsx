'use client'

import type { SectionProps } from '@/components/sections/registry'

export function CounterCard({ customBullets }: SectionProps) {
  if (!customBullets || !customBullets.length) return null

  return (
    <div className="bg-[#181a1f] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          {customBullets.map((bullet: any, i: number) => (
            <div key={i} className="relative flex items-center justify-center">
              {/* Counter box */}
              <div className="border border-[#5e5f63] p-5 h-[170px] w-[230px] flex flex-col items-center justify-center text-center relative">
                {/* Headline label floated above border */}
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-[#131519] px-2 h-[30px] flex items-center justify-center max-w-[90px]">
                    <p className="text-white text-2xl leading-none m-0 font-bold">
                      {bullet.headline}
                    </p>
                  </div>
                </div>
                {/* Content */}
                <div
                  className="text-white uppercase [&_h3]:text-[40px] [&_h3]:font-black [&_h3]:mb-0 [&_h3]:leading-10 [&_strong]:text-white [&_strong]:text-[11px] [&_strong]:tracking-[2px]"
                  dangerouslySetInnerHTML={{ __html: bullet.content ?? '' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
