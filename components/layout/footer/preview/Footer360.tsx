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

const MAIN_LINKS = [
  { text: 'Home', url: '/' },
  { text: 'About', url: '/about' },
  { text: 'Schedule', url: '/schedule' },
  { text: 'Contact', url: '/contact' },
]

export function Footer360Preview({ initialOrganization, initialLocation, initialLocations, initialDomain }: Props) {
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
  const services = organization.services ?? []

  return (
    <footer className="bg-[#0c161b] overflow-hidden relative py-12" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">

          {/* Logo - desktop only */}
          {logoUrl && (
            <div className="hidden md:block">
              <Image
                src={logoUrl}
                alt="Organization logo"
                width={180}
                height={80}
                style={{ maxWidth: 180, width: '100%', height: 'auto' }}
              />
            </div>
          )}

          {/* Main Links */}
          <div>
            <h5 className="text-white text-xl font-normal mb-4">Main Links</h5>
            <ul className="space-y-1 list-none p-0 m-0">
              {MAIN_LINKS.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.url}
                    className="text-[rgba(255,255,255,0.702)] hover:text-white text-sm no-underline block py-1"
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fitness Classes */}
          <div>
            <h5 className="text-white text-xl font-normal mb-4">Fitness Classes</h5>
            <ul className="space-y-1 list-none p-0 m-0">
              {services.map((service: any, i: number) => (
                <li key={i}>
                  <Link
                    href={`/classes/${service.slug}`}
                    className="text-[rgba(255,255,255,0.702)] hover:text-white text-sm no-underline block py-1"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h5 className="text-white text-xl font-normal mb-4">Contact Us</h5>
            <address className="text-[rgba(255,255,255,0.702)] text-sm not-italic leading-6 mb-3">
              {location.street && <>{location.street}<br /></>}
              {[location.city, location.state?.name, location.zip_code].filter(Boolean).join(', ')}
            </address>
            {location.pretty_phone && (
              <div className="flex items-center gap-1 flex-wrap">
                <a
                  href={phoneLink}
                  className="text-[rgba(255,255,255,0.702)] hover:text-white text-sm no-underline"
                >
                  {location.pretty_phone}
                </a>
                {location.pretty_secondary_phone && secondaryPhoneLink && (
                  <>
                    <span className="text-[rgba(255,255,255,0.702)]"> / </span>
                    <a
                      href={secondaryPhoneLink}
                      className="text-[rgba(255,255,255,0.702)] hover:text-white text-sm no-underline"
                    >
                      {location.pretty_secondary_phone}
                    </a>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logo - mobile only */}
        {logoUrl && (
          <div className="mt-10 mb-6 flex justify-center md:hidden">
            <Image
              src={logoUrl}
              alt="Organization logo"
              width={180}
              height={80}
              style={{ maxWidth: 180, width: '100%', height: 'auto' }}
            />
          </div>
        )}

        <div className="bg-[#0b161b] py-5 text-center mt-4">
          <p className="text-[rgba(255,255,255,0.5)] text-sm m-0">
            Copyright &copy; {new Date().getFullYear()} - {domain}
          </p>
        </div>
      </div>
    </footer>
  )
}
