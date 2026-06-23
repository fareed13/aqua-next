'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, MapPin, Phone } from 'lucide-react'
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

const INDUSTRY_CHOICES: Record<string, string> = {
  fitness_center: 'Fitness',
  gym: 'Gym',
  salon: 'Salon',
  martial_arts: 'Martial Arts',
}

export function SalonFooter({ initialOrganization, initialLocation, initialLocations, initialDomain }: Props) {
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
  const accentColor = (organization as any)?.colors?.['color-primary'] || 'var(--org-primary, #9b59b6)'
  const industryLabel = INDUSTRY_CHOICES[organization.industry_type] ?? 'Salon'
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#F6F6F8] text-gray-800" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">

          {/* Col 1 (3/12): Logo + social icons */}
          <div className="md:col-span-3 flex flex-col items-center gap-5">
            <Link href="/">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Organization logo"
                  width={150}
                  height={70}
                  style={{ maxWidth: 150, width: '100%', height: 'auto' }}
                />
              ) : (
                <span className="text-gray-800 font-bold text-lg">{organization.name}</span>
              )}
            </Link>
            {socialMedia.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {socialMedia.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${item.platform} page`}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <SocialIcon platform={item.platform} size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Col 2 (5/12): Main Links */}
          <div className="md:col-span-5">
            <h3 className="text-gray-800 text-lg font-semibold mb-2">Main Links</h3>
            <div
              className="mb-5 border-t-2 border-dotted"
              style={{ borderColor: accentColor }}
            />
            <ul className="space-y-1 list-none p-0 m-0">
              {MAIN_LINKS.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.url}
                    className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm no-underline py-1 group"
                  >
                    <ChevronRight
                      size={14}
                      className="text-gray-400 group-hover:text-gray-700 flex-shrink-0 transition-colors"
                      style={{ color: accentColor }}
                      aria-hidden="true"
                    />
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 (4/12): Contact Us */}
          <div className="md:col-span-4">
            <h3 className="text-gray-800 text-lg font-semibold mb-2">Contact Us</h3>
            <div
              className="mb-5 border-t-2 border-dotted"
              style={{ borderColor: accentColor }}
            />
            <div className="space-y-3">
              {(location.street || location.city) && (
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <address className="text-gray-700 text-sm not-italic leading-6">
                    {location.street && <div>{location.street}</div>}
                    <div>
                      {[location.city, location.state?.name, location.zip_code].filter(Boolean).join(', ')}
                    </div>
                  </address>
                </div>
              )}
              {location.pretty_phone && (
                <div className="flex items-center gap-2">
                  <Phone
                    size={16}
                    className="flex-shrink-0"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  <a
                    href={phoneLink}
                    className="text-gray-700 hover:text-gray-900 text-sm no-underline"
                  >
                    {location.pretty_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-gray-300 py-4 text-center">
        <p className="text-gray-500 text-xs m-0 px-4">
          Copyright &copy; {year} | {domain} |{' '}
          <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-800 no-underline">
            Privacy Policy
          </Link>
          {' | '}
          {industryLabel} Websites Powered by{' '}
          <a
            href="https://abbi.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-800 no-underline"
          >
            Abbi.AI
          </a>
        </p>
      </div>
    </footer>
  )
}
