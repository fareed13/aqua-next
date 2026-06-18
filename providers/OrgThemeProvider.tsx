'use client'

import { useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { applyOrgColors } from '@/lib/utils/orgColors'
import { applyOrgFonts } from '@/lib/utils/fonts'

export function OrgThemeProvider({ children }: { children: React.ReactNode }) {
  const organization = useOrgStore((s) => s.organization)
  const location = useOrgStore((s) => s.location)

  useEffect(() => {
    if (organization?.colors) {
      applyOrgColors(organization.colors)
    }

    // Location-level font overrides take priority over org-level fonts
    const fonts = location?.fonts ?? organization?.fonts
    if (fonts) {
      applyOrgFonts(fonts)
    }
  }, [organization?.colors, organization?.fonts, location?.fonts])

  return <>{children}</>
}
