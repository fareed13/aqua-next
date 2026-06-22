'use client'

import { useMemo } from 'react'
import Image from 'next/image'
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
 * HeaderDefault preview — read-only static preview of the HeaderDefault layout.
 * Black top bar: hamburger + logo + classes link left, CTA + login right.
 */
export function HeaderDefaultPreview({ initialOrganization, initialLocation, initialLocations }: Props) {
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
  const ctaBg = accentColor && /^#000|^rgba\(0,\s*0,\s*0,\s*1\)/i.test(accentColor) ? 'gray' : (accentColor || 'gray')
  const loginColor = accentColor && /^#000|^rgba\(0,\s*0,\s*0,\s*1\)/i.test(accentColor) ? 'white' : (accentColor || 'gray')

  return (
    <div className="relative w-full overflow-hidden rounded border border-gray-200">
      <header className="bg-black" style={{ minHeight: 85 }} aria-label="Main navigation preview">
        {/* Social icons */}
        {socialMedia.length > 0 && (
          <div className="flex justify-end gap-2 px-6 pt-2">
            {socialMedia.map((sm, i) => (
              <span key={i} className="flex h-6 w-6 items-center justify-center rounded-full bg-[#666] text-white">
                <SocialIcon platform={sm.platform} size={14} />
              </span>
            ))}
          </div>
        )}

        <div className="flex h-[85px] items-center justify-between px-4">
          {/* Left */}
          <div className="flex items-center gap-2">
            <span className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#272727] text-white">
              <Menu size={22} />
            </span>
            <div className="mx-[30px]">
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
            {showClassesLink && (
              <span
                className="hidden pb-1 text-sm font-medium uppercase text-white md:block"
                style={{ borderBottom: `2px solid ${underlineColor}` }}
              >
                {organization.school_type ?? 'Fitness Classes'}
              </span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {!isLoggedIn && (
              <span
                className="rounded px-4 py-2 text-sm font-medium uppercase text-white"
                style={{ backgroundColor: ctaBg }}
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
