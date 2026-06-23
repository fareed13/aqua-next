'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
  initialDomain: string
}

const MAIN_LINKS = [
  { text: 'Home', url: '/' },
  { text: 'About', url: '/about' },
  { text: 'Schedule', url: '/schedule' },
  { text: 'Contact', url: '/contact' },
]

export function FooterAbbi({ initialOrganization, initialLocation, initialLocations, initialDomain }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)
  const storeDomain = useOrgStore((s) => s.domain)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations
  const domain = storeDomain || initialDomain

  const phoneLink = location.phone ? `tel:${location.phone}` : '#'
  const logoUrl = buildMediaUrl(organization.primary_logo, 350)
  const socialMedia = location.social_media ?? []

  return (
    <footer className="bg-[#0d161b] py-12" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Col 1 (30%): Address */}
          <div className="md:col-span-1" style={{ flex: '0 0 30%' }}>
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-4">ADDRESS</h4>
            <address className="text-[rgba(255,255,255,0.7)] text-sm not-italic leading-7">
              {organization.name && <div className="font-medium text-white">{organization.name}</div>}
              {location.street && <div>{location.street}</div>}
              <div>
                {[location.city, location.state?.name, location.zip_code].filter(Boolean).join(', ')}
              </div>
            </address>
            {location.pretty_phone && (
              <div className="mt-3">
                <a
                  href={phoneLink}
                  className="text-[rgba(255,255,255,0.7)] hover:text-white text-sm no-underline"
                >
                  {location.pretty_phone}
                </a>
              </div>
            )}
          </div>

          {/* Col 2 (20%): Main Links */}
          <div className="md:col-span-1">
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-4">MAIN LINKS</h4>
            <ul className="space-y-2 list-none p-0 m-0">
              {MAIN_LINKS.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.url}
                    className="text-[rgba(255,255,255,0.7)] hover:text-white text-sm no-underline"
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 (20%): Social Media */}
          <div className="md:col-span-1">
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-4">SOCIAL MEDIA</h4>
            {socialMedia.length > 0 ? (
              <ul className="space-y-2 list-none p-0 m-0">
                {socialMedia.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[rgba(255,255,255,0.7)] hover:text-white text-sm no-underline capitalize"
                    >
                      {item.platform}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[rgba(255,255,255,0.4)] text-sm">—</p>
            )}
          </div>

          {/* Col 4 (30%): Logo */}
          <div className="md:col-span-1 flex items-center justify-center md:justify-end">
            {logoUrl ? (
              <Link href="/">
                <Image
                  src={logoUrl}
                  alt="Organization logo"
                  width={200}
                  height={90}
                  style={{ maxWidth: 200, width: '100%', height: 'auto' }}
                />
              </Link>
            ) : (
              <Link href="/" className="text-white text-xl font-semibold no-underline">
                {organization.name}
              </Link>
            )}
          </div>
        </div>

        {/* Copyright row */}
        <div className="mt-10 border-t border-[rgba(255,255,255,0.1)] pt-5 text-center">
          <p className="text-[rgba(255,255,255,0.45)] text-sm m-0">
            Copyright &copy; {new Date().getFullYear()} - {domain}
          </p>
        </div>
      </div>
    </footer>
  )
}
