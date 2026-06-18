'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function WhyChoiceUs({ headline, content, customBullets }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const isUk = (org as any)?.country?.toLowerCase?.() === 'gb'
  const bullets = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="bg-[#111111] py-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-10">
          <h3 className="mb-5 text-center text-[33px] font-extrabold uppercase leading-tight text-white md:text-[56px] md:leading-[64px]">
            {headline}
          </h3>
          {content && (
            <div
              className="mx-auto max-w-[730px] text-center text-base leading-[31px] text-white"
              dangerouslySetInnerHTML={{ __html: content ?? '' }}
            />
          )}
        </div>

        {/* Gallery grid */}
        {bullets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3">
            {bullets.map((bullet: any, i: number) => (
              <div
                key={i}
                className="group relative max-h-[255px] overflow-hidden"
              >
                {bullet.media && (
                  <Image
                    src={buildMediaUrl(bullet.media)}
                    alt={bullet.headline || bullet.content || 'Gallery image'}
                    width={600}
                    height={255}
                    className="h-[255px] w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div
                  className="absolute bottom-8 hidden w-[220px] px-5 py-5 transition-all group-hover:block"
                  style={{ backgroundColor: 'var(--org-primary)' }}
                >
                  <span className="block text-white">{bullet.headline}</span>
                  <strong className="text-sm uppercase tracking-wide text-white">
                    {bullet.content}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA button */}
        <div className="mt-16 text-center">
          <Link
            href="/classes"
            className="relative inline-flex h-[60px] items-center px-10 pl-[85px] text-white no-underline before:absolute before:left-5 before:h-px before:w-10 before:bg-white"
            style={{ backgroundColor: 'var(--org-primary)', borderRadius: 0 }}
            aria-label={`Choose a ${isUk ? 'Programme' : 'Program'}`}
          >
            Choose a {isUk ? 'Programme' : 'Program'}
          </Link>
        </div>
      </div>
    </div>
  )
}
