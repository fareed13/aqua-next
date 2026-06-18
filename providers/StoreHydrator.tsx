'use client'

import { useEffect } from 'react'
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
  const initFromServerData = useOrgStore((s) => s.initFromServerData)

  useEffect(() => {
    initFromServerData({ organization, location, locations, domain, targetLocations })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
