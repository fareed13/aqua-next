'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

/**
 * Location facility image gallery — ports Nuxt components/facilities/LocationFacilityMedias.vue.
 * On a location page it shows that location's `locationmedias`; on any other page
 * (no matching slug) it aggregates medias from all locations. Sorted by priority desc.
 */
export function LocationFacilityMedias(_props: SectionProps) {
  const locations = useOrgStore(s => s.locations)
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug.toLowerCase() : ''

  const images = useMemo(() => {
    const matched = slug ? locations.find(l => l.slug?.toLowerCase() === slug) : null
    // No matching location → aggregate across all locations (Nuxt behaviour).
    const locationsToUse = matched ? [matched] : locations

    const allMedias = locationsToUse.flatMap(loc =>
      Array.isArray(loc.locationmedias) ? loc.locationmedias : [],
    )

    return allMedias
      .slice()
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .map(el => el.media)
      .filter((m): m is NonNullable<typeof m> => !!m?.uuid && !!m.extension)
      .map(m => buildMediaUrl(m, 700))
  }, [locations, slug])

  if (images.length === 0) return null

  return (
    <div className="row-gallery px-0">
      <h2 className="text-center py-5 font-[Poppins] text-2xl md:text-3xl">Images</h2>
      <div className="flex flex-wrap">
        {images.map((src, i) => (
          <div key={i} className="flex-1 min-w-[150px]">
            <Image
              src={src}
              alt="Location facility image"
              width={150}
              height={150}
              loading="lazy"
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
