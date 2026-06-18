import { BlackHeader } from './header/BlackHeader'
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
