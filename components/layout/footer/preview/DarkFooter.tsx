'use client'

import { useOrgStore } from '@/store/orgStore'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { parseTime24, formatTime12 } from '@/lib/utils/time'
import { MapPin } from 'lucide-react'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
  initialDomain: string
}

export function DarkFooterPreview({ initialOrganization, initialLocation, initialLocations, initialDomain }: Props) {
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
  const mailLink = location.email ? `mailto:${location.email}` : '#'
  const socialMedia = location.social_media ?? []

  return (
    <footer className="bg-[#2f2f2f] py-12" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {/* Locations */}
          <div>
            <h4 className="mb-6 text-sm font-normal uppercase tracking-[2px] text-white">
              Locations
            </h4>
            {locations.map((loc) => (
              <div key={loc.id} className="mb-4 flex items-start gap-2">
                <MapPin size={18} className="mt-0.5 shrink-0 text-white" />
                <p className="text-sm leading-6 text-white">
                  {organization.name}
                  {loc.street && <><br />{loc.street}</>}
                  <br />
                  {[loc.city, loc.state?.name, loc.zip_code].filter(Boolean).join(', ')}
                </p>
              </div>
            ))}
          </div>

          {/* Hours of Operation */}
          {(location.hours_of_operation?.length ?? 0) > 0 && (
            <div>
              <h4 className="mb-6 text-sm font-normal uppercase tracking-[2px] text-white">
                Hours of Operation
              </h4>
              <div className="space-y-1">
                {location.hours_of_operation.map((hop, i) => (
                  <div key={i} className="flex max-w-xs justify-between gap-4">
                    <span className="text-sm font-semibold capitalize text-white">{hop.day}:</span>
                    <span className="text-sm text-white">
                      {formatTime12(parseTime24(hop.start))} – {formatTime12(parseTime24(hop.end))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="mb-6 text-sm font-normal uppercase tracking-[2px] text-white">
              Contact Us
            </h4>
            <div className="space-y-2 text-sm">
              {location.pretty_phone && (
                <p className="text-2xl font-semibold">
                  <a href={phoneLink} className="text-white no-underline hover:underline">
                    {location.pretty_phone}
                  </a>
                </p>
              )}
              <p className="text-white">
                {location.pretty_phone && (
                  <>
                    Call:{' '}
                    <a href={phoneLink} className="text-white hover:underline">
                      {location.pretty_phone}
                    </a>
                    {location.pretty_secondary_phone && secondaryPhoneLink && (
                      <>
                        {' / '}
                        <a href={secondaryPhoneLink} className="text-white hover:underline">
                          {location.pretty_secondary_phone}
                        </a>
                      </>
                    )}
                  </>
                )}
              </p>
              {location.email && (
                <p className="text-white">
                  Email:{' '}
                  <a href={mailLink} className="text-white hover:underline">
                    {location.email}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-[#464646]" />

        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
          <p className="text-sm text-white">© {domain}</p>
          {socialMedia.length > 0 && (
            <div className="flex items-center gap-3">
              {socialMedia.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${item.platform} page`}
                  className="text-[#aaa] transition-colors hover:text-white"
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
