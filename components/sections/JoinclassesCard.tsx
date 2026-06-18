'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function JoinclassesCard({ headline, content }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const services: any[] = (org as any)?.services ?? []

  return (
    <div className="bg-[#171d29] py-24">
      {/* Heading */}
      <div className="mx-auto max-w-[700px] px-7 text-center">
        <h3 className="relative pb-8 text-[35px] font-bold leading-[34px] text-[#d5242c] md:text-5xl md:leading-[52px]">
          <span className="block text-center text-[#d5242c]">{headline}</span>
          <span className="absolute bottom-3 left-0 right-0 mx-auto h-1.5 w-[70px] rounded-full bg-[#d5242c]" />
        </h3>
        {content && (
          <div
            className="mx-auto mt-[70px] max-w-[700px] text-center text-sm text-white md:text-base"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        )}
      </div>

      {/* Cards */}
      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service: any, i: number) => {
            const imgUrl =
              service.large_media?.uuid && service.large_media?.extension
                ? `${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${service.large_media.uuid}_1200.${service.large_media.extension}`
                : ''
            return (
              <div
                key={i}
                className="flex min-h-[330px] flex-col items-start rounded bg-[#f2f2f2] p-5 md:flex-row md:p-8"
              >
                <div className="flex-1">
                  <h4 className="mt-5 text-3xl font-bold text-[#d5242c]">
                    {service.name}
                  </h4>
                  <h5 className="mt-0 max-w-[240px] text-3xl font-bold leading-[30px] text-[#171d29]">
                    {service.type}
                  </h5>
                  <p className="mt-8 max-w-[250px] text-sm text-[#333]">
                    {service.short_description}
                  </p>
                  <Link
                    href={`/${service.slug}`}
                    className="mt-5 mb-5 flex h-[45px] w-[170px] items-center justify-center bg-[#d5242c] text-sm text-white"
                    aria-label={`Join ${service.name} class`}
                  >
                    Join Class &rarr;
                  </Link>
                </div>
                {imgUrl && (
                  <div className="mt-4 md:mt-0">
                    <Image
                      src={imgUrl}
                      alt={service.name || 'Service image'}
                      width={280}
                      height={300}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
