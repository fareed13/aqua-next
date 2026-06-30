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
              <div key={instructor.id ?? idx} className="relative mt-7 group">

                {/* Vertical accent line — thicker, grows on group hover */}
                <div
                  className="absolute right-0 bottom-10 w-[2px] h-[150px] group-hover:h-[180px] transition-all duration-300"
                  style={{ backgroundColor: accentColor }}
                />

                {/* White card — shadow lifts on hover */}
                <div className="relative bg-white shadow-md group-hover:shadow-xl transition-shadow duration-300">

                  {/* Image wrapper — clips the zoom transform */}
                  <div className="overflow-hidden">
                    <Image
                      src={imgUrl || '/placeholder.jpg'}
                      alt={`${instructor.name} - ${subtitle || 'Instructor'}`}
                      width={350}
                      height={400}
                      className="w-full object-cover px-[10px] transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </div>

                  {/* Accent bar — slides in from left on hover */}
                  <div
                    className="h-[3px] w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: accentColor }}
                  />

                  {/* Name */}
                  <h3 className="uppercase text-center font-black mt-[10px] mb-[14px] text-[20px] break-words px-[10px] tracking-wide">
                    {instructor.name}
                  </h3>

                  {/* Rotated subtitle label — anchored to this relative card */}
                  {subtitle && (
                    <span
                      className="absolute top-[53px] -right-[63px] uppercase text-xs font-semibold tracking-widest"
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
