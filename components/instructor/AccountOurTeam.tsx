'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function AccountOurTeam({ headline }: SectionProps) {
  const staff = useOrgStore(s => s.location)?.staff ?? []
  const instructors = staff.slice(0, 3)

  return (
    <div className="bg-[#fafafa] py-[50px]">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-10">
          <h4
            className="text-xl text-center relative max-w-[195px] mx-auto flex items-center justify-center gap-2 mb-1"
            style={{ color: 'var(--org-primary)' }}
          >
            <span className="flex-1 border-t border-current mt-1" />
            Our Team
            <span className="flex-1 border-t border-current mt-1" />
          </h4>
          {headline && (
            <h2 className="text-center text-[43px] mt-[5px] text-[#212529] font-normal">
              {headline}
            </h2>
          )}
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {instructors.map((instructor, idx) => {
            const imgUrl = instructor.media ? buildMediaUrl(instructor.media) : ''
            return (
              <div key={instructor.id ?? idx} className="relative">
                {/* Image */}
                <div className="relative w-full h-[400px]">
                  <Image
                    src={imgUrl || '/placeholder.jpg'}
                    alt={instructor.name || 'Instructor photo'}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Caption card */}
                <div className="bg-white shadow-[2px_4px_18px_rgba(204,204,204,0.51)] py-[30px] px-0 text-center mx-[30px] -mt-[60px] z-[999] relative">
                  <h3 className="font-bold text-lg text-[#212529] px-4">
                    {instructor.name}
                  </h3>
                  <div
                    className="line-clamp-2 overflow-hidden text-ellipsis px-4 text-sm text-[#555]"
                    dangerouslySetInnerHTML={{ __html: instructor.bio ?? '' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
