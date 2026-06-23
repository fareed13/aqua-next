'use client'

import { useOrgStore } from '@/store/orgStore'

const SOCIAL_ICONS: Record<string, string> = {
  facebook: '📘', instagram: '📷', twitter: '🐦', youtube: '▶️',
  linkedin: '💼', pinterest: '📌', snapchat: '👻', google: '🔍',
}

export function Locations() {
  const organization = useOrgStore((s) => s.organization)
  const locations = organization?.locations ?? []
  const orgName = organization?.name ?? ''

  if (!locations.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-500">No locations found.</p>
      </div>
    )
  }

  return (
    <div className="relative mb-5">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {locations.map((loc, index) => (
          <div key={loc.id ?? index} className="border-b border-gray-300 py-8 px-3">
            <div className="text-left">
              <p className="mb-0">
                <strong>{orgName} - {loc.city || loc.target_locations?.[0]}</strong>
              </p>
              <span className="text-gray-600 block mt-1">
                {loc.street}, {loc.city}, {loc.state?.name} {loc.zip_code}
              </span>
              {loc.pretty_phone && (
                <a href={`tel:${loc.phone}`} className="text-gray-600 flex items-center gap-2 mt-2">
                  <span>📞</span> {loc.pretty_phone}
                </a>
              )}
            </div>
            {loc.social_media?.length > 0 && (
              <div className="flex gap-4 mt-3">
                {loc.social_media.map((sm, i) => (
                  <a
                    key={i}
                    href={sm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl"
                    aria-label={sm.platform}
                  >
                    {SOCIAL_ICONS[sm.platform.toLowerCase()] ?? '🔗'}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
