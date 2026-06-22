'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Smartphone } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
  initialDomain: string
}

const INDUSTRY_CHOICES: Record<string, string> = {
  fitness_center: 'Fitness',
  gym: 'Gym',
  salon: 'Salon',
  martial_arts: 'Martial Arts',
}

export function GymFooter({ initialOrganization, initialLocation, initialLocations, initialDomain }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)
  const storeDomain = useOrgStore((s) => s.domain)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations
  const domain = storeDomain || initialDomain

  const phoneLink = location.phone ? `tel:${location.phone}` : '#'
  const secondaryPhoneLink = location.secondary_phone ? `tel:${location.secondary_phone}` : null
  const logoUrl = buildMediaUrl(organization.primary_logo, 350)
  const accentColor = (organization as any)?.colors?.['color-primary'] || 'var(--org-primary, #e53e3e)'
  const industryLabel = INDUSTRY_CHOICES[organization.industry_type] ?? 'Fitness'
  const year = new Date().getFullYear()

  return (
    <footer className="bg-black text-white" aria-label="Site footer">

      {/* Main section — only shown when single location */}
      {locations.length === 1 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-center">

            {/* Col 1: Location */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <MapPin size={32} style={{ color: accentColor }} aria-hidden="true" />
              <h4
                className="text-sm font-bold uppercase tracking-widest m-0"
                style={{ color: accentColor }}
              >
                LOCATION
              </h4>
              <address className="text-[rgba(255,255,255,0.75)] text-sm not-italic leading-6 text-center md:text-left">
                {organization.name && <div className="text-white font-medium">{organization.name}</div>}
                {location.street && <div>{location.street}</div>}
                <div>
                  {[location.city, location.state?.name, location.zip_code].filter(Boolean).join(', ')}
                </div>
              </address>
            </div>

            {/* Col 2: Logo */}
            <div className="flex justify-center">
              <Link href="/">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt="Organization logo"
                    width={160}
                    height={80}
                    style={{ maxWidth: 160, width: '100%', height: 'auto' }}
                  />
                ) : (
                  <span className="text-white font-bold text-xl">{organization.name}</span>
                )}
              </Link>
            </div>

            {/* Col 3: Call Us */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <Phone size={32} style={{ color: accentColor }} aria-hidden="true" />
              <h4
                className="text-sm font-bold uppercase tracking-widest m-0"
                style={{ color: accentColor }}
              >
                CALL US
              </h4>
              <div className="text-[rgba(255,255,255,0.75)] text-sm text-center md:text-right">
                {location.pretty_phone ? (
                  <a
                    href={phoneLink}
                    className="text-[rgba(255,255,255,0.75)] hover:text-white no-underline block"
                  >
                    {location.pretty_phone}
                  </a>
                ) : (
                  <span className="text-[rgba(255,255,255,0.4)]">—</span>
                )}
                {location.pretty_secondary_phone && secondaryPhoneLink && (
                  <a
                    href={secondaryPhoneLink}
                    className="text-[rgba(255,255,255,0.75)] hover:text-white no-underline flex items-center gap-1 justify-center md:justify-end mt-1"
                  >
                    <Smartphone size={14} aria-hidden="true" />
                    {location.pretty_secondary_phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multiple locations: just show centered logo */}
      {locations.length !== 1 && (
        <div className="py-14 flex justify-center">
          <Link href="/">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Organization logo"
                width={160}
                height={80}
                style={{ maxWidth: 160, width: '100%', height: 'auto' }}
              />
            ) : (
              <span className="text-white font-bold text-xl">{organization.name}</span>
            )}
          </Link>
        </div>
      )}

      {/* Copyright bar */}
      <div className="border-t border-[rgba(255,255,255,0.1)] py-4 text-center">
        <p className="text-[rgba(255,255,255,0.45)] text-xs m-0 px-4">
          Copyright &copy; {year} | {domain} |{' '}
          <Link href="/privacy-policy" className="text-[rgba(255,255,255,0.45)] hover:text-white no-underline">
            Privacy Policy
          </Link>
          {' | '}
          {industryLabel} Websites Powered by{' '}
          <a
            href="https://abbi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgba(255,255,255,0.45)] hover:text-white no-underline"
          >
            Abbi.AI
          </a>
        </p>
      </div>
    </footer>
  )
}
