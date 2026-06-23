'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
  initialDomain: string
}

export function FooterDefault({ initialOrganization, initialLocation, initialLocations, initialDomain }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)
  const storeDomain = useOrgStore((s) => s.domain)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations
  const domain = storeDomain || initialDomain

  const phoneLink = location.phone ? `tel:${location.phone}` : '#'
  const mailLink = location.email ? `mailto:${location.email}` : '#'
  const logoUrl = buildMediaUrl(organization.primary_logo, 350)
  const year = new Date().getFullYear()

  return (
    <footer
      className="py-12 text-white"
      style={{ backgroundColor: 'var(--footer-background, #1a1a2e)' }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-center">

          {/* Col 1 (5/12): Org info — right-aligned on desktop */}
          <div className="md:col-span-5 text-center md:text-right">
            {organization.name && (
              <p className="text-white font-semibold text-lg mb-2">{organization.name}</p>
            )}
            {location.street && (
              <p className="text-[rgba(255,255,255,0.7)] text-sm leading-6">
                {location.street}
              </p>
            )}
            {(location.city || location.state?.name || location.zip_code) && (
              <p className="text-[rgba(255,255,255,0.7)] text-sm leading-6">
                {[location.city, location.state?.name, location.zip_code].filter(Boolean).join(', ')}
              </p>
            )}
            {location.pretty_phone && (
              <p className="text-[rgba(255,255,255,0.7)] text-sm mt-1">
                <a href={phoneLink} className="text-[rgba(255,255,255,0.7)] hover:text-white no-underline">
                  {location.pretty_phone}
                </a>
              </p>
            )}
            {location.email && (
              <p className="text-[rgba(255,255,255,0.7)] text-sm mt-1">
                <a href={mailLink} className="text-[rgba(255,255,255,0.7)] hover:text-white no-underline">
                  {location.email}
                </a>
              </p>
            )}
          </div>

          {/* Col 2 (2/12): Center logo */}
          <div className="md:col-span-2 flex justify-center">
            <Link href="/">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Organization logo"
                  width={120}
                  height={60}
                  style={{ maxWidth: 120, width: '100%', height: 'auto' }}
                />
              ) : (
                <span className="text-white font-bold text-lg">{organization.name}</span>
              )}
            </Link>
          </div>

          {/* Col 3 (5/12): Copyright + links */}
          <div className="md:col-span-5 text-center md:text-left hidden md:block">
            <p className="text-[rgba(255,255,255,0.5)] text-sm leading-6">
              Copyright &copy; {year} {domain}
            </p>
            <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">
              <Link href="/privacy-policy" className="text-[rgba(255,255,255,0.5)] hover:text-white no-underline">
                Privacy Policy
              </Link>
              {' | '}
              <a
                href="https://abbi.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgba(255,255,255,0.5)] hover:text-white no-underline"
              >
                Abbi.AI
              </a>
            </p>
          </div>
        </div>

        {/* Mobile copyright */}
        <div className="mt-8 text-center md:hidden">
          <p className="text-[rgba(255,255,255,0.5)] text-sm">
            Copyright &copy; {year} {domain}
          </p>
          <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">
            <Link href="/privacy-policy" className="text-[rgba(255,255,255,0.5)] hover:text-white no-underline">
              Privacy Policy
            </Link>
            {' | '}
            <a
              href="https://abbi.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgba(255,255,255,0.5)] hover:text-white no-underline"
            >
              Abbi.AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
