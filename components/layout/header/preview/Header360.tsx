'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
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
 * Header360 preview — read-only static preview of the Header360 layout.
 * Black background, logo left, nav items + yellow CTA right.
 */
export function Header360Preview({ initialOrganization, initialLocation, initialLocations }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations

  const userToken = useAuthStore((s) => s.userToken)
  const isLoggedIn = !!userToken

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Get Started Today'
  const accentColor = (organization as any)?.colors?.['app-main-accent-color'] || '#f4ca59'

  const menuItems = useMemo(
    () => buildMenuItems(organization, location, locations, isLoggedIn),
    [organization, location, locations, isLoggedIn],
  )

  return (
    <div className="relative w-full overflow-hidden rounded border border-gray-200">
      <header className="bg-black px-4 py-2" aria-label="Main navigation preview">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${organization.name} logo`}
                width={200}
                height={60}
                className="h-[60px] w-auto max-w-[200px] object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-white">{organization.name}</span>
            )}
          </div>

          {/* Nav + CTA */}
          <div className="flex items-center gap-1">
            {menuItems.slice(0, 4).map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium uppercase text-white"
              >
                {item.name}
                {(item.children?.length ?? 0) > 0 && <ChevronDown size={14} />}
              </span>
            ))}
            <span
              className="ml-4 rounded-full px-5 py-1.5 text-sm font-medium text-black"
              style={{ backgroundColor: accentColor }}
            >
              {callToAction}
            </span>
          </div>
        </div>
      </header>
    </div>
  )
}
