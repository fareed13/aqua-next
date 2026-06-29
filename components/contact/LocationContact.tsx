'use client'

import { useOrgStore } from '@/store/orgStore'
import { FitnessGoals } from '@/components/sections/FitnessGoals'

interface HyperLink {
  name: string
  link: string
}

interface LocationContactProps {
  locationId: number
}

function normalizeUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `http://${url}`
}

export function LocationContact({ locationId }: LocationContactProps) {
  const organization = useOrgStore((s) => s.organization)
  const locations = useOrgStore((s) => s.locations)
  const accentColor = (organization as any)?.colors?.['app-main-accent-color'] ?? '#000'

  const locationObj = locations?.find((l) => l.id === locationId)
  if (!locationObj) return null

  const hyperLinks = ((locationObj as any).hyper_links ?? []) as HyperLink[]
  const hasSeo = locationObj.seo_headline && locationObj.seo_description

  return (
    <div className="px-4">
      {hasSeo && (
        <FitnessGoals
          component="FitnessGoals"
          headline={locationObj.seo_headline!}
          content={locationObj.seo_description!}
        />
      )}
      {hyperLinks.length > 0 && (
        <div className="my-5">
          <h2 className="text-center text-2xl font-bold mb-4">Useful Links</h2>
          <ul className="max-w-sm mx-auto list-none p-0">
            {hyperLinks.map((hl, i) => (
              <li key={i} className="text-center py-1">
                <a
                  href={normalizeUrl(hl.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium no-underline hover:underline"
                  style={{ color: accentColor }}
                >
                  {hl.name?.trim() ? hl.name : hl.link}
                  {' ↗'}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
