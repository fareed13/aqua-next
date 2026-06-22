'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Menu, User } from 'lucide-react'
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
 * WhiteHeader preview — read-only static preview of WhiteHeader layout.
 * White background, circle hamburger, logo left, org-colored login + book now right.
 */
export function WhiteHeaderPreview({ initialOrganization, initialLocation, initialLocations }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Book Now'
  const isGiftCardEnabled = (organization as any)?.is_gift_card_enabled ?? false

  const accentColor = (organization as any)?.colors?.['app-main-accent-color']
  const darkerBg = (organization as any)?.colors?.['app-darker-background'] || '#333'
  const giftColor = (organization as any)?.colors?.['app-main-accent-with-transparent'] || 'var(--org-primary)'
  const isWhiteAccent = accentColor && /^#FFF|^rgba\(255,\s*255,\s*255,\s*1\)/i.test(accentColor)
  const loginColor = isWhiteAccent ? 'black' : (accentColor || 'gray')

  return (
    <div className="relative w-full overflow-hidden rounded border border-gray-200">
      <nav className="bg-white" style={{ minHeight: 84 }} aria-label="Main navigation preview">
        <div className="flex h-[84px] items-center justify-between px-2">
          {/* Left: toggle + logo */}
          <div className="flex items-center gap-2">
            <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#333] text-white mt-[10px]">
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
            {isGiftCardEnabled && (
              <span
                className="px-3 py-1.5 text-sm font-medium text-white"
                style={{ backgroundColor: giftColor }}
              >
                Gift Certificate
              </span>
            )}
            <span
              className="px-3 py-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: darkerBg }}
            >
              {callToAction}
            </span>
            <span
              className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm"
              style={{ borderColor: loginColor, color: loginColor }}
            >
              <User size={15} />
              Login
            </span>
          </div>
        </div>
      </nav>
    </div>
  )
}
