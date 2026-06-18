'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function DentalAboutUs({ headline, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)

  const staffs = (org as any)?.staffs ?? []
  const staff = staffs.length > 0 ? staffs[0] : null

  const bgUrl = staff?.media?.uuid
    ? `${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${staff.media.uuid}_900.${staff.media.extension}`
    : (media && media.length > 0 ? buildMediaUrl(media[0]) : '')

  return (
    <div
      className="relative flex min-h-[500px] items-center justify-end bg-cover bg-center md:min-h-[700px]"
      style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined }}
    >
      <div className="mx-4 bg-white/90 p-6 md:mx-0 md:max-w-[650px] md:bg-white md:p-8">
        {headline && (
          <h4 className="text-sm font-semibold uppercase tracking-wide text-black">
            {headline}
          </h4>
        )}
        {staff && (
          <h3
            className="mt-1 mb-2 text-xl font-semibold"
            style={{ color: 'var(--org-primary)' }}
          >
            Dr. {staff.name}
          </h3>
        )}
        {staff?.bio && (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: staff.bio }}
          />
        )}
        {staff && (
          <a
            href={`/instructors/${staff.slug}`}
            className="mt-4 mb-5 inline-block rounded-full px-8 py-2.5 text-xs text-white"
            style={{ backgroundColor: 'var(--org-primary)' }}
            aria-label={`Learn more about Dr. ${staff.name}`}
          >
            Learn more
          </a>
        )}
      </div>
    </div>
  )
}
