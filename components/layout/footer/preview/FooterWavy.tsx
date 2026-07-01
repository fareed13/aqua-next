'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Organization, Location } from '@/types/api'

const INDUSTRY_LABELS: Record<string, string> = {
  fitness_center: 'EFC',
  salon: 'EFC',
  junk_removal: 'EFC',
}

const PhoneIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#636363', display: 'inline-block' }} aria-hidden="true">
    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.5 11.5 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.5 11.5 0 0 0 .57 3.6 1 1 0 0 1-.24 1.01l-2.2 2.18Z" />
  </svg>
)

const EmailIcon = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" style={{ color: '#636363', display: 'inline-block' }} aria-hidden="true">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
)

const DecorativeLine = () => (
  <span
    aria-hidden="true"
    style={{
      position: 'absolute',
      display: 'block',
      width: 200,
      height: 2,
      background: '#fff',
      left: 0,
      right: 0,
      margin: 'auto',
      marginTop: 46,
    }}
  />
)

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
  const secondaryPhoneLink = location.secondary_phone ? `tel:${location.secondary_phone}` : '#'
  const mailLink = location.email ? `mailto:${location.email}` : '#'
  const logoUrl = buildMediaUrl(organization.primary_logo, 350)
  const socialMedia = location.social_media ?? []
  const year = new Date().getFullYear()
  const industryLabel = INDUSTRY_LABELS[organization.industry_type ?? '']

  const country = (organization.country ?? '').toLowerCase()
  const showTermsBar = country.includes('australia') || country.includes('new zealand')

  return (
    <footer
      className="text-center text-white"
      style={{
        backgroundImage: "url('/assets/img/footer-bg.png')",
        backgroundSize: 'cover',
        padding: '100px 0 130px',
      }}
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-[1185px] px-4">

        {/* 3-column top row — phone | logo | email */}
        <div className="flex flex-wrap items-center justify-center">

          {/* Phone — .footer-widget { top: 100px } */}
          <div className="w-full px-3 sm:w-1/3" style={{ position: 'relative', top: 100 }}>
            <PhoneIcon />
            <p style={{ color: '#fff', fontSize: 13, marginTop: 5, position: 'relative' }}>
              {location.pretty_phone ? (
                <a href={phoneLink} style={{ color: '#fff', textDecoration: 'none' }}>
                  {location.pretty_phone}
                </a>
              ) : null}
              {location.pretty_phone && location.pretty_secondary_phone ? ' / ' : null}
              {location.pretty_secondary_phone ? (
                <a href={secondaryPhoneLink} style={{ color: '#fff', textDecoration: 'none' }}>
                  {location.pretty_secondary_phone}
                </a>
              ) : null}
              <DecorativeLine />
            </p>
          </div>

          {/* Logo — .logo-widget { top: 110px } */}
          <div className="w-full px-3 sm:w-1/3" style={{ position: 'relative', top: 110 }}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="School logo"
                width={220}
                height={80}
                style={{ objectFit: 'contain', margin: '0 auto', display: 'block', width: 220, height: 'auto' }}
                loading="lazy"
              />
            ) : (
              <span className="text-xl font-bold text-white">{organization.name}</span>
            )}
          </div>

          {/* Email — .footer-widget { top: 100px } */}
          <div className="w-full px-3 sm:w-1/3" style={{ position: 'relative', top: 100 }}>
            <EmailIcon />
            <p style={{ color: '#f0f0f0', fontSize: 13, marginTop: 5, position: 'relative' }}>
              {location.email ? (
                <a href={mailLink} style={{ color: '#f0f0f0', textDecoration: 'none' }}>
                  {location.email}
                </a>
              ) : null}
              <DecorativeLine />
            </p>
          </div>

        </div>

        {/* Bottom row — copyright + social — .logo-widget { top: 110px } */}
        <div className="text-center" style={{ position: 'relative', top: 110 }}>

          {/* Terms bar — AU / NZ only */}
          {showTermsBar && (
            <div className="mb-2">
              <Link href="/terms-of-service" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, margin: '0 8px' }}>
                Terms of service
              </Link>
              {' | '}
              <Link href="/refund-policy" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, margin: '0 8px' }}>
                Refund Policy
              </Link>
              {locations.length < 2 && location.abn && (
                <>
                  {' | '}
                  <span style={{ color: '#fff', fontSize: 13, margin: '0 8px' }}>ABN: {location.abn}</span>
                </>
              )}
            </div>
          )}

          <p style={{ color: '#fff', fontSize: 13, marginTop: 15 }}>
            &copy; Copyright {year} | {domain} |{' '}
            <Link href="/privacy-policy" style={{ color: '#fff', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <span style={{ color: '#fff', lineHeight: '36px', paddingBottom: 5, display: 'block', fontSize: 13 }}>
              {industryLabel ? `${industryLabel} Websites ` : ''}Powered by{' '}
              <a href="https://abbi.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                Abbi.AI
              </a>
            </span>
          </p>

          {/* Social icons — outlined rounded buttons */}
          {socialMedia.length > 0 && (
            <div className="mt-3 flex items-center justify-center">
              {socialMedia.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${item.platform} page`}
                  className="flex items-center justify-center rounded-full border"
                  style={{ borderColor: '#f9f9f9', color: '#f9f9f9', height: 35, minWidth: 35, padding: 0, margin: '0 7px' }}
                >
                  <SocialIcon platform={item.platform} size={18} />
                </a>
              ))}
            </div>
          )}

        </div>
      </div>
    </footer>
  )
}
