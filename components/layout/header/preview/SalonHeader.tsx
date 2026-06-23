'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
}

/**
 * SalonHeader preview — read-only static preview.
 * White background, circle hamburger, logo left, action buttons right.
 */
export function SalonHeaderPreview({ initialOrganization, initialLocation, initialLocations }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Book Now'
  const accentColor = (organization as any)?.colors?.['app-darker-background'] || '#333'
  const giftColor = (organization as any)?.colors?.['app-main-accent-with-transparent'] || 'var(--org-primary)'
  const loginColor = (organization as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  return (
    <div className="relative w-full overflow-hidden rounded border border-gray-200">
      <nav className="bg-white" style={{ minHeight: 84 }} aria-label="Main navigation preview">
        <div className="flex h-[84px] items-center justify-between px-2">
          {/* Left: toggle + logo */}
          <div className="flex items-center gap-2">
            <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#272727] text-white mt-[10px]">
              <Menu size={20} />
            </span>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${organization.name} logo`}
                width={227}
                height={60}
                className="ml-2 h-[60px] w-auto max-w-[227px] object-contain"
              />
            ) : (
              <span className="ml-2 text-lg font-bold text-gray-900">{organization.name}</span>
            )}
          </div>

          {/* Right: buttons */}
          <div className="flex items-center gap-2 pr-2">
            <span
              className="px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: giftColor }}
            >
              Gift Certificate
            </span>
            <span
              className="px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              {callToAction}
            </span>
            <span
              className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm"
              style={{ borderColor: loginColor, color: loginColor }}
            >
              Existing Customers
            </span>
          </div>
        </div>
      </nav>
    </div>
  )
}
