'use client'

import { useRef } from 'react'
import { useOrgStore } from '@/store/orgStore'
import type { Organization, Location } from '@/types/api'

interface Props {
  organization: Organization
  location: Location
  locations: Location[]
  domain: string
  targetLocations: string[]
  children: React.ReactNode
}

export function StoreHydrator({ organization, location, locations, domain, targetLocations, children }: Props) {
  // Hydrate the org store SYNCHRONOUSLY on the first render — not in a useEffect.
  // A parent's effect runs AFTER its descendants' mount effects, so an effect here
  // would leave the store empty while child components fetch on mount (e.g. useFaqs
  // for FaqTwo), which drops organization_id from those requests. Populating during
  // render mirrors Nuxt/Pinia, where store.organization.id is available synchronously.
  const hydrated = useRef(false)
  if (!hydrated.current) {
    useOrgStore.getState().initFromServerData({ organization, location, locations, domain, targetLocations })
    hydrated.current = true
  }

  return <>{children}</>
}
