'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function StaffList() {
  const org = useOrgStore(s => s.organization)
  const staff = org?.staffs ?? []

  if (staff.length === 0) return null

  const industryType = (org as any)?.industry_type ?? ''
  let heading = staff.length > 1 ? 'Our Instructors' : 'Our Instructor'
  if (industryType === 'salon') {
    heading = staff.length > 1 ? 'Our Stylists' : 'Our Stylist'
  } else if (industryType === 'accounting') {
    heading = 'Our Team'
  }

  return (
    <div className="bg-white relative z-[5] -mt-[50px] pb-[120px] max-[767px]:-mt-[15px]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="uppercase block text-center my-10 text-4xl font-bold">
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          {staff.map((instructor, idx) => {
            const imgUrl = instructor.media
              ? buildMediaUrl(instructor.media, 700)
              : ''

            return (
              <div key={instructor.id ?? idx} className="my-8">
                <Link
                  href={`/instructors/${instructor.slug}`}
                  className="text-white no-underline"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  <div className="mx-4 border-[8px] border-[#c7c7c7] group relative">
                    <div className="relative w-full aspect-[3/4]">
                      <Image
                        src={imgUrl || '/placeholder.jpg'}
                        alt={instructor.name || 'Staff photo'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        loading="lazy"
                      />
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
