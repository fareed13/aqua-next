import { DarkFooter } from './footer/DarkFooter'
import { Footer360 } from './footer/Footer360'
import { FooterAbbi } from './footer/FooterAbbi'
import { FooterDefault } from './footer/FooterDefault'
import { FooterWavy } from './footer/FooterWavy'
import { GymFooter } from './footer/GymFooter'
import { SalonFooter } from './footer/SalonFooter'
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
  Footer360,
  FooterAbbi,
  FooterDefault,
  FooterWavy,
  GymFooter,
  SalonFooter,
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
