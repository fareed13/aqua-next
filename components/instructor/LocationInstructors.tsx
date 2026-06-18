'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function LocationInstructors({ headline }: SectionProps) {
  const location = useOrgStore(s => s.location)
  const staff = location?.staff ?? []

  if (staff.length === 0) return null

  const displayHeadline = headline || 'Our Instructors'

  return (
    <div className="bg-white relative z-[5] -mt-11 pb-[120px]">
      <div className="container mx-auto px-4">
        <h2 className="uppercase block text-center my-10 text-4xl font-bold">
          {displayHeadline}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {staff.map((instructor, idx) => {
            const imgUrl = instructor.media ? buildMediaUrl(instructor.media) : ''
            return (
              <div key={instructor.id ?? idx} className="my-8">
                <Link
                  href={`/instructors/${instructor.slug}`}
                  className="text-white no-underline"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  <div className="mx-4 border-[8px] border-[#c7c7c7] group relative flex flex-col h-full">
                    <div className="relative w-full" style={{ aspectRatio: '3/4', minHeight: '400px' }}>
                      <Image
                        src={imgUrl || '/placeholder.jpg'}
                        alt={instructor.name || 'Staff photo'}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                      {/* Name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/80 group-hover:bg-[rgba(213,36,44,0.8)] transition-all duration-500 px-3 py-3 w-full">
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
