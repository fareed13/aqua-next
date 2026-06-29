import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/providers/Providers'
import { StoreHydrator } from '@/providers/StoreHydrator'
import { HeaderRegistry } from '@/components/layout/HeaderRegistry'
import { FooterRegistry } from '@/components/layout/FooterRegistry'
import { AnalyticsScripts } from '@/components/layout/AnalyticsScripts'
import { Suspense } from 'react'
import { PopupStepperCheckout } from '@/components/popupForm/PopupStepperCheckout'
import { HomePageEmbeds } from '@/components/layout/HomePageEmbeds'
import { Widgets } from '@/components/dynamic-widgets/Widgets'
import { BottomRequestFormDefault } from '@/components/bottomRequestForm/BottomRequestFormDefault'
import { fetchOrganization, fetchCustomCss } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildGoogleFontsUrl } from '@/lib/utils/fonts'
import { buildOrgColorStyle } from '@/lib/utils/orgColors'
import { buildLocalBusinessSchema, buildFaqSchema, buildProductSchemas } from '@/lib/utils/metaTags'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'https://d3k0lk57n8zw9s.cloudfront.net'

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', svg: 'image/svg+xml', webp: 'image/webp',
}

// Global favicon — page-level generateMetadata inherits from here
export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  const ext  = org?.primary_logo?.extension ?? ''
  const logo = org?.primary_logo?.uuid
    ? `${MEDIA_URL}/${org.primary_logo.uuid}_350.${ext}`
    : ''
  const mime = MIME_MAP[ext.toLowerCase()] ?? 'image/png'
  return {
    icons: logo
      ? {
          icon:     [{ url: logo, type: mime }],
          shortcut: [{ url: logo, type: mime }],
          apple:    [{ url: logo, type: mime }],
        }
      : undefined,
  }
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
  // Keep CSS vars for colors + the two shared font vars (globals.css references them)
  const orgFontVars = [
    fonts.p ? `--org-font-body:"${fonts.p}",sans-serif` : '',
    fonts.h1 ? `--org-font-heading:"${fonts.h1}",sans-serif` : '',
  ].filter(Boolean).join(';')
  const orgStyle = [orgColorVars, orgFontVars].filter(Boolean).join(';')

  // Per-element font rules matching Nuxt's organizationFontStyles — each heading
  // level can have its own font family (h2 != h1, h3 != h2, etc.)
  const FONT_SELECTORS: Array<[keyof typeof fonts, string]> = [
    ['p', 'body, p'],
    ['h1', 'h1'],
    ['h2', 'h2'],
    ['h3', 'h3'],
    ['h4', 'h4'],
    ['h5', 'h5'],
    ['h6', 'h6'],
  ]
  const orgFontElementRules = FONT_SELECTORS
    .filter(([key]) => fonts[key])
    .map(([key, selector]) => `${selector}{font-family:"${fonts[key]}",sans-serif!important}`)
    .join('')

  const fontsUrl = buildGoogleFontsUrl(fonts)
  const customCss = await fetchCustomCss(domain)

  const localBusinessSchema = buildLocalBusinessSchema(organization, location, domain)
  const faqSchema = buildFaqSchema(organization)
  const productSchemas = buildProductSchemas(organization, domain)

  const logoExt  = organization.primary_logo?.extension ?? ''
  const logoUrl  = organization.primary_logo?.uuid
    ? `${MEDIA_URL}/${organization.primary_logo.uuid}_350.${logoExt}`
    : ''
  const logoMime = MIME_MAP[logoExt.toLowerCase()] ?? 'image/png'

  return (
    <html lang="en">
      <head>
        {orgStyle && <style>{`:root{${orgStyle}}`}</style>}
        {orgFontElementRules && <style>{orgFontElementRules}</style>}
        {customCss && <style>{customCss}</style>}
        {/* Explicit favicon — prevents Next.js default /favicon.ico from winning */}
        {logoUrl && <link rel="icon" href={logoUrl} type={logoMime} />}
        {logoUrl && <link rel="apple-touch-icon" href={logoUrl} />}
        {/* Preconnect to CDNs — matches Nuxt nuxt.config head.link */}
        <link rel="preconnect" href="https://d3k0lk57n8zw9s.cloudfront.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://duvyeenkq0cxj.cloudfront.net" crossOrigin="anonymous" />
        {fontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={fontsUrl} rel="stylesheet" />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        {productSchemas.map((schema, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        ))}
      </head>
      <body>
        <Providers>
          <Toaster position="top-center" richColors closeButton />
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
            <BottomRequestFormDefault />
            <main>{children}</main>
            <HomePageEmbeds />
            <FooterRegistry
              name={footerName}
              organization={organization}
              location={location}
              locations={locations}
              domain={domain}
            />
            <Suspense><PopupStepperCheckout /></Suspense>
            <Widgets />
            <AnalyticsScripts />
          </StoreHydrator>
        </Providers>
      </body>
    </html>
  )
}
