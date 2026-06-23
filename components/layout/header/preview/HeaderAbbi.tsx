'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'
import { buildMenuItems } from '@/lib/utils/menuItems'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
}

/**
 * HeaderAbbi preview — read-only static preview of the HeaderAbbi layout.
 * Semi-transparent dark bg, centered logo, blue Login link.
 */
export function HeaderAbbiPreview({ initialOrganization, initialLocation, initialLocations }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations

  const userToken = useAuthStore((s) => s.userToken)
  const isLoggedIn = !!userToken

  const logoUrl = buildMediaUrl(organization?.primary_logo)

  return (
    <div className="relative w-full overflow-hidden rounded border border-gray-200">
      <header
        className="flex flex-col items-center px-4 py-3"
        style={{ background: 'rgba(0,0,0,0.2)' }}
        aria-label="Main navigation preview"
      >
        {/* Logo */}
        <div className="mb-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${organization.name} logo`}
              width={200}
              height={70}
              className="h-[70px] w-auto max-w-[200px] object-contain"
            />
          ) : (
            <span className="text-lg font-bold text-white">{organization.name}</span>
          )}
        </div>

        {/* Login + CTA row */}
        <div className="flex items-center gap-3">
          <span
            className="rounded border px-3 py-1 text-sm font-bold uppercase"
            style={{ color: '#435fe7', borderColor: '#435fe7', background: '#fff' }}
          >
            Login
          </span>
          <span
            className="rounded-full px-5 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: '#435fe7' }}
          >
            Secure your spot
          </span>
        </div>
      </header>
    </div>
  )
}
