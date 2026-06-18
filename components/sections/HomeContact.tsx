'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'
import type { Media } from '@/types/api'

const SOCIAL_COLORS: Record<string, string> = {
  linkedin: '#007bb6',
  yahoo: '#400090',
  facebook: '#4e71a8',
  instagram: '#444',
  twitter: '#1cb7eb',
  google: '#34A853',
  snapchat: '#FFFC00',
  pinterest: '#dc4e41',
  youtube: '#FF0000',
}

export function HomeContact({ headline, content, media }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const loc = useOrgStore(s => s.location)

  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Image */}
        <div className="flex items-end justify-center md:w-1/2 md:justify-end">
          {imgUrl && (
            <Image
              src={imgUrl}
              alt={headline || 'Contact image'}
              width={600}
              height={400}
              className="object-contain"
            />
          )}
        </div>

        {/* Details */}
        <div className="md:w-1/2">
          <div className="mt-10 bg-[#f2f2f2] p-8 md:p-10">
            <h3 className="relative mb-10 text-3xl font-extrabold leading-tight text-[#171d29] md:text-4xl">
              {headline}
              <span className="absolute bottom-[-20px] left-0 h-1.5 w-[70px] rounded-full bg-[#d5242c]" />
            </h3>
            {content && (
              <div
                className="mt-12 text-base leading-[30px]"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}

            <div className="mt-4 divide-y divide-white">
              {/* Address */}
              <div className="py-5">
                <p className="font-bold">Address:</p>
                <span className="mt-1.5 block text-sm">
                  {org?.name}
                  <br />
                  {loc?.street}
                  <br />
                  {loc?.city ? `${loc.city},` : ''}{' '}
                  {(loc?.state as any)?.name ?? ''} {loc?.zip_code}
                </span>
              </div>

              {/* Phone */}
              {loc?.pretty_phone && (
                <div className="py-5">
                  <p className="font-bold">Contact phones:</p>
                  <a
                    href={`tel:${loc.pretty_phone}`}
                    className="mt-1.5 block text-sm text-black no-underline"
                    aria-label={`Call ${loc.pretty_phone}`}
                  >
                    {loc.pretty_phone}
                  </a>
                </div>
              )}

              {/* Email */}
              {loc?.email && (
                <div className="py-5">
                  <p className="font-bold">Email address:</p>
                  <a
                    href={`mailto:${loc.email}`}
                    className="mt-1.5 block text-sm text-black no-underline"
                    aria-label={`Email ${loc.email}`}
                  >
                    {loc.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Social links */}
          {loc?.social_media && (loc.social_media as any[]).length > 0 && (
            <div className="mt-5 flex flex-wrap gap-4">
              {(loc.social_media as any[]).map((sm: any, i: number) => {
                const key = sm.platform?.toLowerCase() ?? ''
                const color = SOCIAL_COLORS[key] ?? '#333'
                return (
                  <a
                    key={i}
                    href={sm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${sm.platform} page`}
                    className="flex h-[60px] w-[17%] min-w-[60px] items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    {sm.platform}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
