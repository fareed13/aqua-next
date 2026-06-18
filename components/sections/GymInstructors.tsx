'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function GymInstructors({ media, customBullets, backgroundImage, content }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  const bgUrl = backgroundImage || ''
  const imgUrl = media && media.length ? buildMediaUrl(media[0]) : ''

  // Get instructors from org staff
  const staffs: any[] = (org as any)?.staffs ?? []
  const instructors = staffs.slice(0, 4).map((s: any) => ({
    img: s.media
      ? buildMediaUrl(s.media, 800)
      : '',
    name: s.name || 'Instructor',
    slug: `instructors/${s.slug || ''}`,
  }))

  // Derive headline
  const services = (loc as any)?.services ?? (org as any)?.services ?? []
  const insHeadline =
    services.length > 0 ? `${services[0]?.name || ''} Instructors` : 'Our Instructors'

  return (
    <div
      className="relative bg-cover bg-center w-full"
      style={{ backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      <div className="relative z-[2] max-w-full">
        <div className="flex flex-col md:flex-row">
          {/* Left: feature image (hidden on mobile) */}
          <div className="hidden md:flex w-full md:w-1/3 items-end justify-center py-0">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={insHeadline}
                width={350}
                height={500}
                className="object-contain max-h-full"
              />
            )}
          </div>

          {/* Right: instructors content */}
          <div className="w-full md:w-2/3 p-8 md:p-10 relative z-[10]">
            <div className="mb-4">
              <h3 className="text-white text-[33px] font-bold">{insHeadline}</h3>
            </div>

            {/* Instructor photos */}
            {instructors.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5 mb-5">
                {instructors.map((inst, ig) => (
                  <div key={ig} className="w-1/2 md:w-1/4 pr-3">
                    {inst.img && (
                      <Image
                        src={inst.img}
                        alt={inst.name}
                        width={200}
                        height={200}
                        className="w-full border-2 border-white object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Stats bullets */}
            {customBullets && customBullets.length > 0 && (
              <div className="flex flex-wrap mt-5 gap-4">
                {customBullets.slice(0, 4).map((bullet: any, i: number) => (
                  <div key={i} className="text-center w-full md:w-1/4">
                    {bullet.headline && (
                      <h3 className="font-black text-[42px] md:text-[65px] text-white mb-0">
                        {bullet.headline}
                      </h3>
                    )}
                    {bullet.content && (
                      <p className="text-white text-[18px] md:text-[27px] font-thin -mt-5 italic uppercase">
                        {bullet.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Caption */}
            <div className="px-0 md:px-10 text-center mt-4">
              {content && (
                <div
                  className="text-center text-white text-[18px] mt-2 leading-[29px]"
                  dangerouslySetInnerHTML={{ __html: content ?? '' }}
                />
              )}
              <a href="/instructors">
                <button
                  className="mt-5 px-8 py-3 text-white font-bold"
                  style={{ backgroundColor: accentColor }}
                  aria-label="View all instructors"
                >
                  View All Instructors
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
