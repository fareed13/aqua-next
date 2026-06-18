'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function ProgramDefault({ headline = "LET'S FIND THE RIGHT PROGRAM FOR YOU" }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)

  const cta = location?.call_to_action || 'Secure Your First Class'
  const services = organization?.services ?? []

  return (
    <div className="py-20 bg-[var(--org-bg)]">
      <div className="max-w-7xl mx-auto px-4 overflow-hidden">
        {headline && (
          <h2 className="block text-center my-10 text-2xl md:text-3xl font-bold uppercase">
            {headline}
          </h2>
        )}

        <div className="flex flex-wrap -mx-2">
          {services.map((service) => {
            const imgUrl = service.large_media
              ? buildMediaUrl(service.large_media)
              : service.small_media
              ? buildMediaUrl(service.small_media)
              : null
            const slug = service.slug || service.id

            return (
              <div
                key={service.id}
                className="w-full sm:w-1/2 md:w-1/3 px-2 mb-8"
              >
                <div className="h-full rounded shadow flex flex-col bg-white overflow-hidden">
                  {/* Card image area */}
                  <div className="relative w-full h-[200px] overflow-hidden">
                    {imgUrl && (
                      <Image
                        src={imgUrl}
                        alt={service.name || 'Program image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 640px"
                        loading="lazy"
                      />
                    )}
                    {/* Title overlay */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent">
                      <h3
                        className="text-white text-base font-semibold px-4 py-2 line-clamp-2"
                        style={{ WebkitLineClamp: 2 }}
                      >
                        {service.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  {service.short_description && (
                    <div className="px-4 pt-3 pb-1 text-sm text-gray-600 flex-1">
                      <div dangerouslySetInnerHTML={{ __html: service.short_description ?? '' }} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center px-2 py-2 gap-2">
                    <Link
                      href={`/classes/${slug}/`}
                      className="text-sm font-medium px-3 py-1 rounded hover:underline"
                      style={{ color: 'var(--org-primary)' }}
                      aria-label={`Learn more about ${service.name}`}
                    >
                      Learn more
                    </Link>
                    <button
                      onClick={() => setDialog(true)}
                      className="text-sm font-medium px-3 py-1 rounded hover:underline"
                      style={{ color: 'var(--org-primary)' }}
                    >
                      {cta}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
