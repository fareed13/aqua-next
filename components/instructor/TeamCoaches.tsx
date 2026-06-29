'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function TeamCoaches({ headline, subtitle, content }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || '#d5242c'
  const instructors = ((org as any)?.staffs ?? []).slice(0, 3)

  return (
    <div className="bg-[#EEEEEE] py-10 md:py-[70px] px-0">
      <div className="mx-auto px-4 w-full max-w-[80%] md:max-w-full lg:max-w-[70%]">
        {/* Title block */}
        <div className="text-center mb-10">
          {headline && (
            <h3 className="text-3xl md:text-[45px] leading-tight md:leading-[64px] tracking-wide uppercase text-center font-extrabold text-[#111111] mb-5 mx-auto max-w-[850px]">
              {headline}
            </h3>
          )}
          {content && (
            <div
              className="text-center text-base text-[#777777] leading-[31px] max-w-[700px] mx-auto"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        {/* Coaches grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {instructors.map((instructor: any, idx: number) => {
            const imgUrl = instructor.media ? buildMediaUrl(instructor.media, 'medium') : ''
            return (
              <div key={instructor.id ?? idx} className="relative mt-7">
                {/* Vertical line decoration */}
                <div
                  className="absolute right-0 bottom-10 w-[1px] h-[150px] hover:h-[180px] transition-all duration-200"
                  style={{ backgroundColor: accentColor }}
                />

                <div className="relative">
                  <Image
                    src={imgUrl || '/placeholder.jpg'}
                    alt={`${instructor.name} - ${subtitle || 'Instructor'}`}
                    width={350}
                    height={400}
                    className="w-full object-cover px-[10px]"
                    loading="lazy"
                  />
                  <h3 className="uppercase text-center font-black mt-[10px] text-[20px]">
                    {instructor.name}
                  </h3>
                  {/* Rotated subtitle label */}
                  {subtitle && (
                    <span
                      className="absolute top-[53px] -right-[63px] uppercase text-xs"
                      style={{
                        color: accentColor,
                        transform: 'rotate(-270deg)',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {subtitle}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
