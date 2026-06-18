'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function OurTeam({ headline, subtitle }: SectionProps) {
  const staff = useOrgStore(s => s.location)?.staff ?? []
  const instructors = staff.slice(0, 3)

  return (
    <div className="bg-[#181a1f] py-8 min-h-0">
      <div className="container mx-auto px-4">
        <div className="mt-5">
          <strong className="text-white text-lg uppercase flex items-center gap-2">
            <span className="inline-block w-12 border-t border-white mt-3" />
            {headline}
          </strong>
          <h3
            className="text-3xl md:text-4xl uppercase mb-5 mt-1 font-bold"
            style={{ color: 'var(--org-primary)' }}
          >
            {subtitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {instructors.map((instructor, idx) => (
            <TeamCard key={instructor.id ?? idx} instructor={instructor} subtitle={subtitle} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TeamCard({ instructor, subtitle }: { instructor: any; subtitle?: string }) {
  const imgUrl = instructor.media ? buildMediaUrl(instructor.media) : ''

  return (
    <div className="group relative">
      {/* Image */}
      <div className="relative w-full h-[450px] overflow-hidden">
        <Image
          src={imgUrl || '/placeholder.jpg'}
          alt={`${instructor.name} - ${subtitle || 'Team member'}`}
          fill
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <div
        className="relative text-center transition-all duration-500 group-hover:-translate-y-10 group-hover:bg-[var(--org-primary)]"
        style={{ backgroundColor: 'var(--org-primary)' }}
      >
        <h3 className="text-white uppercase font-black pt-4 px-4 text-lg group-hover:text-white">
          {instructor.name}
        </h3>
        <div
          className="text-[#6e6e6e] uppercase font-black text-xs px-7 py-2 line-clamp-8 group-hover:text-white group-hover:line-clamp-none"
          dangerouslySetInnerHTML={{ __html: instructor.bio ?? '' }}
        />
        <div className="hidden group-hover:block pb-6">
          <Link
            href={`/instructors/${instructor.slug}`}
            aria-label={`View ${instructor.name}'s profile`}
            className="inline-flex items-center justify-center border border-white text-white w-10 h-[35px] mx-1 text-sm"
          >
            +
          </Link>
        </div>
      </div>
    </div>
  )
}
