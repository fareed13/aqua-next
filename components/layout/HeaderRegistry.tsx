import { BlackHeader } from './header/BlackHeader'
import { Header2 } from './header/Header2'
import { Header360 } from './header/Header360'
import { HeaderAbbi } from './header/HeaderAbbi'
import { HeaderDefault } from './header/HeaderDefault'
import { SalonHeader } from './header/SalonHeader'
import { WhiteHeader } from './header/WhiteHeader'
import type { Organization, Location } from '@/types/api'

interface Props {
  name: string
  organization: Organization
  location: Location
  locations: Location[]
}

type HeaderComponent = React.ComponentType<{
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
}>

const HEADERS: Record<string, HeaderComponent> = {
  BlackHeader,
  Header2,
  Header360,
  HeaderAbbi,
  HeaderDefault,
  SalonHeader,
  WhiteHeader,
}

export function HeaderRegistry({ name, organization, location, locations }: Props) {
  const Header = HEADERS[name] ?? HEADERS.BlackHeader
  return (
    <Header
      initialOrganization={organization}
      initialLocation={location}
      initialLocations={locations}
    />
  )
}
