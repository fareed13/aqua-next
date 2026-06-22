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

export function FooterWavyPreview({ initialOrganization, initialLocation, initialLocations, initialDomain }: Props) {
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
  const socialMedia = location.social_media ?? []
  const year = new Date().getFullYear()

  return (
    <footer
      className="py-12 text-white relative overflow-hidden"
      style={{ backgroundColor: '#1a1a2e' }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* 3-column main row */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-center">

          {/* Col 1: Phone */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                />
              </svg>
              {location.pretty_phone ? (
                <a
                  href={phoneLink}
                  className="text-white hover:text-white/80 text-base no-underline font-medium"
                >
                  {location.pretty_phone}
                </a>
              ) : (
                <span className="text-[rgba(255,255,255,0.4)] text-sm">No phone listed</span>
              )}
            </div>
          </div>

          {/* Col 2: Logo centered, pulled up slightly */}
          <div className="flex justify-center relative -top-3">
            <Link href="/">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Organization logo"
                  width={160}
                  height={70}
                  style={{ maxWidth: 160, width: '100%', height: 'auto' }}
                />
              ) : (
                <span className="text-white font-bold text-xl">{organization.name}</span>
              )}
            </Link>
          </div>

          {/* Col 3: Email */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              {location.email ? (
                <a
                  href={mailLink}
                  className="text-white hover:text-white/80 text-base no-underline font-medium"
                >
                  {location.email}
                </a>
              ) : (
                <span className="text-[rgba(255,255,255,0.4)] text-sm">No email listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: copyright + privacy + social icons */}
        <div className="mt-10 border-t border-[rgba(255,255,255,0.15)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[rgba(255,255,255,0.5)] text-sm text-center sm:text-left m-0">
            Copyright &copy; {year} {domain}
            {' | '}
            <Link href="/privacy-policy" className="text-[rgba(255,255,255,0.5)] hover:text-white no-underline">
              Privacy Policy
            </Link>
          </p>

          {socialMedia.length > 0 && (
            <div className="flex items-center gap-3">
              {socialMedia.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${item.platform} page`}
                  className="text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
                >
                  <SocialIcon platform={item.platform} size={20} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
