import { fetchOrganization, fetchDynamicRoutes } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { LocationContact } from '@/components/contact/LocationContact'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const routes = await fetchDynamicRoutes()
  return routes
    .filter(r => /^\/location\/[^/]+$/.test(r))
    .map(r => ({ slug: r.split('/')[2] }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({
    org,
    domain,
    pageName: 'location-slug',
    pageSlug: slug,
    path: `/location/${slug}`,
  })
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]

  const locationObj = organization.locations.find(
    (l) => l.slug.toLowerCase() === slug.toLowerCase()
  )

  if (!locationObj) {
    notFound()
  }

  const title =
    locationObj.target_locations?.length > 0
      ? locationObj.target_locations[0]
      : locationObj.city

  const sections = locationObj.content ?? []

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline={title} />
      <LocationContact locationId={locationObj.id} />
      {sections.map((section, i) => (
        <SectionRenderer key={`${section.component}-${i}`} section={section} />
      ))}
    </div>
  )
}
