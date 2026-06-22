'use client'

import { useState } from 'react'
import { useOrgStore } from '@/store/orgStore'

export function CheckoutTopBanner() {
  const [showBanner, setShowBanner] = useState(true)
  const organization = useOrgStore((s) => s.organization)

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'crimson'

  if (!showBanner) return null

  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center px-4 py-2">
        <span className="uppercase text-sm md:text-base font-bold flex-1 text-center">
          Beginner classes sell out in 3-days (20 Members In Each Group) 4 Spots Remaining
        </span>
        <button
          onClick={() => setShowBanner(false)}
          className="ml-4 text-lg font-bold leading-none"
          style={{ color: accentColor }}
          aria-label="Dismiss banner"
        >
          ×
        </button>
      </div>
    </div>
  )
}
