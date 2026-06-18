import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/providers/Providers'
import { StoreHydrator } from '@/providers/StoreHydrator'
import { HeaderRegistry } from '@/components/layout/HeaderRegistry'
import { FooterRegistry } from '@/components/layout/FooterRegistry'
import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildGoogleFontsUrl } from '@/lib/utils/fonts'
import { buildOrgColorStyle } from '@/lib/utils/orgColors'

export const metadata: Metadata = {
  title: 'ABBI.AI',
  description: 'EFC Websites By ABBI.AI',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const domain = getDomain()
  const data = await fetchOrganization(domain)

  // Log the raw shape so we can see exactly what the API returns
  // console.log('[layout] raw data type:', Array.isArray(data) ? 'array' : typeof data)
  // console.log('[layout] data[0]:', JSON.stringify(data[0] ?? data, null, 2).slice(0, 500))

  // API returns [Organization] — handle both array and bare-object responses
  const organization = Array.isArray(data) ? data[0] : (data as unknown as import('@/types/api').Organization)

  if (!organization) {
    throw new Error(
      `fetchOrganization returned no data for domain "${domain}". ` +
      `Check NEXT_PUBLIC_DEFAULT_PAGE_DOMAIN in .env.local and that the backend is reachable.`
    )
  }

  const locations = [...(organization.locations ?? [])]
  const location = locations[0]

  if (!location) {
    throw new Error(`Organization "${organization.name}" has no locations.`)
  }

  const headerName = organization.shared?.header ?? 'BlackHeader'
  const footerName = organization.shared?.footer ?? 'DarkFooter'

  // Bake org colors + fonts into the static HTML — zero FOUC, zero production fetch
  const fonts = location?.fonts ?? organization?.fonts ?? {}
  const orgColorVars = buildOrgColorStyle(organization.colors ?? {})
  const orgFontVars = [
    fonts.p ? `--org-font-body:"${fonts.p}",sans-serif` : '',
    fonts.h1 ? `--org-font-heading:"${fonts.h1}",sans-serif` : '',
  ].filter(Boolean).join(';')
  const orgStyle = [orgColorVars, orgFontVars].filter(Boolean).join(';')

  const fontsUrl = buildGoogleFontsUrl(fonts)

  return (
    <html lang="en">
      <head>
        {orgStyle && <style>{`:root{${orgStyle}}`}</style>}
        {fontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={fontsUrl} rel="stylesheet" />
          </>
        )}
      </head>
      <body>
        <Providers>
          <StoreHydrator
            organization={organization}
            location={location}
            locations={locations}
            domain={domain}
            targetLocations={location.target_locations ?? []}
          >
            <HeaderRegistry
              name={headerName}
              organization={organization}
              location={location}
              locations={locations}
            />
            <main>{children}</main>
            <FooterRegistry
              name={footerName}
              organization={organization}
              location={location}
              locations={locations}
              domain={domain}
            />
          </StoreHydrator>
        </Providers>
      </body>
    </html>
  )
}
