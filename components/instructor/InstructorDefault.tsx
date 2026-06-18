'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function InstructorDefault({ headline }: SectionProps) {
  const staff = useOrgStore(s => s.location)?.staff ?? []
  const instructors = staff.slice(0, 3)

  if (instructors.length === 0) return null

  const displayHeadline = headline || 'Our Instructors'

  return (
    <div className="bg-white relative z-[5] -mt-11 pb-[120px]">
      <div className="container mx-auto px-4">
        <h2 className="uppercase block text-center my-10 text-4xl font-bold">
          {displayHeadline}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {instructors.map((instructor, idx) => {
            const imgUrl = instructor.media ? buildMediaUrl(instructor.media) : ''
            return (
              <div key={instructor.id ?? idx} className="mb-8">
                <Link
                  href={`/instructors/${instructor.slug}`}
                  className="text-white no-underline"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  <div className="mx-4 border-[8px] border-[#c7c7c7] group relative">
                    <div className="relative w-full aspect-[3/4]">
                      <Image
                        src={imgUrl || '/placeholder.jpg'}
                        alt={instructor.name || 'Instructor photo'}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                      {/* Name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 group-hover:bg-[rgba(213,36,44,0.8)] transition-all duration-500 px-3 py-3">
                        <p className="uppercase text-center text-white font-bold text-2xl break-words m-0">
                          {instructor.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
