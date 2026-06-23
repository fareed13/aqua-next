'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, User } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'
import { buildMenuItems } from '@/lib/utils/menuItems'
import { buildMediaUrl } from '@/lib/utils/media'
import { SocialIcon } from '@/components/layout/SocialIcon'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
}

/**
 * BlackHeader preview — read-only static preview of the BlackHeader layout.
 * No interactive state, no sidebar, no scroll tracking.
 */
export function BlackHeaderPreview({ initialOrganization, initialLocation, initialLocations }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations

  const userToken = useAuthStore((s) => s.userToken)
  const isLoggedIn = !!userToken

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Secure Your First Class'
  const socialMedia = location.social_media ?? []
  const topLevelServices = organization.services?.filter((s) => !s.parent_service) ?? []
  const showClassesLink = topLevelServices.length > 0
  const underlineColor = (organization as any)?.colors?.['main-accent-text-underline'] || '#d5242c'
  const accentColor = (organization as any)?.colors?.['app-main-accent-color']
  const loginColor = accentColor && /^#000|^rgba\(0,\s*0,\s*0,\s*1\)/i.test(accentColor) ? 'white' : (accentColor || 'gray')

  const menuItems = useMemo(
    () => buildMenuItems(organization, location, locations, isLoggedIn),
    [organization, location, locations, isLoggedIn],
  )

  return (
    <div className="relative w-full overflow-hidden rounded border border-gray-200">
      <header className="bg-black" aria-label="Main navigation preview">
        {/* Social icons */}
        {socialMedia.length > 0 && (
          <div className="flex justify-end gap-2 px-6 pt-2">
            {socialMedia.map((sm, i) => (
              <span
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#666] text-white"
                aria-label={sm.platform}
              >
                <SocialIcon platform={sm.platform} size={14} />
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* Left: hamburger + logo + classes */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#272727] text-white">
              <Menu size={22} />
            </span>
            <div className="mx-[30px]">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${organization.name} logo`}
                  width={200}
                  height={60}
                  className="h-[60px] w-auto object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-white">{organization.name}</span>
              )}
            </div>
            {showClassesLink && (
              <span
                className="relative hidden pb-1 text-sm font-medium uppercase text-white md:block"
                style={{ borderBottom: `2px solid ${underlineColor}` }}
              >
                {organization.school_type ?? 'Fitness Classes'}
              </span>
            )}
          </div>

          {/* Right: CTA + login */}
          <div className="flex items-center gap-2">
            {!isLoggedIn && (
              <span
                className="hidden sm:block rounded px-4 py-2 text-sm font-medium uppercase text-white"
                style={{ backgroundColor: 'var(--org-primary)' }}
              >
                {callToAction}
              </span>
            )}
            <span
              className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm"
              style={{ borderColor: loginColor, color: loginColor }}
            >
              <User size={15} />
              Login
            </span>
          </div>
        </div>
      </header>
    </div>
  )
}
