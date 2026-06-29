'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl, buildBackgroundUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function GymInstructors({ headline, media, customBullets, backgroundImage, content }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  const bgUrl = buildBackgroundUrl(backgroundImage)
  const imgUrl = media && media.length ? buildMediaUrl(media[0], 'medium') : ''

  // Derive headline matching Nuxt's created() logic
  const industryType = (org as any)?.industry_type || ''
  let insHeadline = headline || ''
  if (industryType === 'salon') insHeadline = 'Our stylists'
  else if (industryType === 'cosmetic_center') insHeadline = 'Our Team'

  // Nuxt filters org.staffs by service_id from props; service_id is not in SectionProps
  // so the filtered array is always empty — matching Nuxt's default rendering
  const instructors: any[] = []

  return (
    <div
      className="relative bg-cover bg-center w-full"
      style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1]" style={{ background: '#0000009c' }} />

      <div className="relative z-[2] max-w-full px-4">
        <div className="flex flex-col md:flex-row">
          {/* Left: feature image — hidden on mobile, hidden on tablet */}
          {imgUrl && (
            <div className="hidden md:flex w-full md:w-1/3 items-end justify-center py-0">
              <Image
                src={imgUrl}
                alt={insHeadline || 'Instructors section image'}
                width={350}
                height={500}
                className="object-contain max-h-full"
                style={{ objectFit: 'contain', maxHeight: '100%' }}
              />
            </div>
          )}

          {/* Right: content */}
          <div className={`w-full ${imgUrl ? 'md:w-2/3' : ''} relative z-[10]`} style={{ padding: '40px 20px' }}>
            {/* Heading */}
            <div style={{ marginBottom: '0' }}>
              <h3 className="text-white" style={{ fontSize: '33px' }}>{insHeadline}</h3>
            </div>

            {/* Instructor photos — only shown when filtered list is non-empty */}
            {instructors.length > 0 && (
              <div className="flex flex-wrap mt-5" style={{ position: 'relative', zIndex: 20 }}>
                {instructors.slice(0, 4).map((inst: any, ig: number) => (
                  <div key={ig} className="w-1/2 md:w-1/4 pr-3">
                    {inst.img && (
                      <Image
                        src={inst.img}
                        alt={inst.name || 'Instructor photo'}
                        width={200}
                        height={200}
                        className="w-full"
                        style={{ border: '2px solid #fff', position: 'relative', zIndex: 20 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Stats / number bullets */}
            {customBullets && customBullets.length > 0 && (
              <div className="flex flex-wrap mt-5">
                {(customBullets as any[]).slice(0, 4).map((bullet: any, i: number) => (
                  <div key={i} className="text-center w-full md:w-1/4" style={{ textAlign: 'center' }}>
                    {bullet.headline && (
                      <h3
                        className="text-white"
                        style={{ fontWeight: 900, fontSize: '65px', marginBottom: 0 }}
                      >
                        {bullet.headline}
                      </h3>
                    )}
                    {bullet.content && (
                      <p
                        className="text-white uppercase italic"
                        style={{ fontSize: '27px', fontWeight: 100, marginTop: '-20px' }}
                      >
                        {bullet.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Caption + CTA */}
            <div style={{ padding: '0px 40px', textAlign: 'center' }}>
              {content && (
                <div
                  className="text-white"
                  style={{ textAlign: 'center', fontSize: '18px', marginTop: '10px', lineHeight: '29px' }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
              <Link href="/instructors">
                <button
                  className="text-white"
                  style={{ backgroundColor: accentColor, marginTop: '20px', padding: '8px 24px' }}
                  aria-label="View all instructors"
                >
                  View All Instructors
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
