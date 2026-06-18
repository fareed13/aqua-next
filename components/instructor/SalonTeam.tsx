'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function SalonTeam({ headline, subtitle }: SectionProps) {
  const staff = useOrgStore(s => s.location)?.staff ?? []
  const instructors = staff.slice(0, 3)

  return (
    <div className="bg-[#fff9f6] py-[50px]">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="mx-auto table text-center mb-8">
          {headline && (
            <strong
              className="text-xl block mb-2"
              style={{ color: 'var(--org-primary)' }}
            >
              {headline}
            </strong>
          )}
          {subtitle && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl" style={{ color: 'var(--org-primary)' }}>&#x007E;</span>
              <h3 className="text-[30px] md:text-[40px] uppercase font-normal capitalize mx-2">
                {subtitle}
              </h3>
              <span className="text-4xl" style={{ color: 'var(--org-primary)' }}>&#x007E;</span>
            </div>
          )}
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {instructors.map((instructor, idx) => {
            const imgUrl = instructor.media ? buildMediaUrl(instructor.media) : ''
            return (
              <div key={instructor.id ?? idx} className="relative">
                {/* Card image */}
                <div className="mx-5 relative z-[9] h-[330px]">
                  <Image
                    src={imgUrl || '/placeholder.jpg'}
                    alt={`${instructor.name} - ${subtitle || 'Team member'}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Card info below image */}
                <div className="relative bg-white shadow-[0_0_10px_#ccc] px-10 pt-[90px] pb-5 -mt-[70px] h-[188px] overflow-hidden">
                  {/* Profile link button */}
                  <Link
                    href={`/instructors/${instructor.slug}`}
                    aria-label={`View ${instructor.name}'s profile`}
                    className="absolute right-[42px] -top-[37px] z-[9] flex items-center justify-center w-[43px] h-[40px] text-white text-xl"
                    style={{ backgroundColor: 'var(--org-primary)' }}
                  >
                    +
                  </Link>

                  <h3
                    className="uppercase font-normal text-[19px] text-[#222222]"
                    style={{ color: 'var(--org-primary)' }}
                  >
                    {instructor.name}
                  </h3>
                  <div
                    className="overflow-hidden text-ellipsis line-clamp-2 max-h-[50px] min-h-[50px]"
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
