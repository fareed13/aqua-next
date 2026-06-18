import { DarkFooter } from './footer/DarkFooter'
import type { Organization, Location } from '@/types/api'

interface Props {
  name: string
  organization: Organization
  location: Location
  locations: Location[]
  domain: string
}

type FooterComponent = React.ComponentType<{
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
  initialDomain: string
}>

const FOOTERS: Record<string, FooterComponent> = {
  DarkFooter,
}

export function FooterRegistry({ name, organization, location, locations, domain }: Props) {
  const Footer = FOOTERS[name] ?? FOOTERS.DarkFooter
  return (
    <Footer
      initialOrganization={organization}
      initialLocation={location}
      initialLocations={locations}
      initialDomain={domain}
    />
  )
}
