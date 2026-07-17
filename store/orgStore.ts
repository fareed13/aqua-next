import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Organization, Location, Service } from '@/types/api'

interface OrgState {
  organization: Organization | null
  locations: Location[]
  location: Location | null
  domain: string
  domainRequest: string
  targetLocations: string[]

  setOrganization: (org: Organization) => void
  setLocations: (locations: Location[]) => void
  setLocation: (location: Location) => void
  setDomain: (domain: string) => void
  setDomainRequest: (domain: string) => void
  setTargetLocations: (targets: string[]) => void
  initFromServerData: (data: {
    organization: Organization
    locations: Location[]
    location: Location
    domain: string
    targetLocations: string[]
  }) => void
}

export const useOrgStore = create<OrgState>()(
  immer((set) => ({
    organization: null,
    locations: [],
    location: null,
    domain: '',
    domainRequest: '',
    targetLocations: [],

    setOrganization: (org) => set((state) => { state.organization = org }),
    setLocations: (locations) => set((state) => { state.locations = locations }),
    setLocation: (location) => set((state) => { state.location = location }),
    setDomain: (domain) => set((state) => { state.domain = domain }),
    setDomainRequest: (domain) => set((state) => { state.domainRequest = domain }),
    setTargetLocations: (targets) => set((state) => { state.targetLocations = targets }),

    initFromServerData: ({ organization, locations, location, domain, targetLocations }) =>
      set((state) => {
        state.organization = organization
        state.locations = locations
        state.location = location
        state.domain = domain
        state.domainRequest = domain
        state.targetLocations = targetLocations
      }),
  }))
)

/** Stable identity — see useOrgServices. Never mutate or return a copy of this. */
const EMPTY_SERVICES: Service[] = []

/**
 * `organization.services`, or a stable empty array until the org loads.
 *
 * Use this instead of `useOrgStore(s => s.organization?.services ?? [])`.
 * zustand v5 hands the selector straight to useSyncExternalStore as BOTH
 * getSnapshot and getServerSnapshot with no memoisation of the result
 * (zustand/esm/react.mjs:6-10). `organization` starts as null, so a `?? []`
 * inside the selector mints a fresh array on every call and React warns
 * "The result of getServerSnapshot should be cached to avoid an infinite loop".
 * Coalescing outside the selector — to a constant, not a literal — keeps the
 * reference stable for both the snapshot check and any downstream deps.
 */
export const useOrgServices = (): Service[] =>
  useOrgStore((s) => s.organization?.services) ?? EMPTY_SERVICES
