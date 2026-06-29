import { fetchOrganization, fetchDynamicRoutes } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { ProgramDefault } from '@/components/programBlocks/ProgramDefault'
import { ReviewsClean } from '@/components/reviews/ReviewsClean'
import { VirtualScheduleDefault } from '@/components/schedule/VirtualScheduleDefault'
import { StaffList } from '@/components/instructor/StaffList'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const routes = await fetchDynamicRoutes()
  return routes
    .filter(r => /^\/locations\/[^/]+$/.test(r))
    .map(r => ({ slug: r.split('/')[2] }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  const location = org.locations[0]
  const targetLoc = (location.target_locations ?? []).find(
    (tl: string) => tl.toLowerCase().replace(/ /g, '-') === slug
  )
  const locationId = targetLoc ? location.id : ''
  return buildPageMetadata({
    org,
    domain,
    pageName: 'locations-slug',
    pageSlug: slug,
    locationId,
    path: `/locations/${slug}`,
  })
}

export default async function TargetLocationPage({ params }: PageProps) {
  const { slug } = await params
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]

  const headerText = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div>
      <LandingPageBanner
        component="LandingPageBanner"
        headline={`Martial Arts in ${headerText}`}
      />

      <div className="max-w-7xl mx-auto px-4">
        <ProgramDefault component="ProgramDefault" headline="What we offer" />
        <ReviewsClean component="ReviewsClean" />
        <h2 className="text-center text-2xl font-bold my-6">Schedules</h2>
        <VirtualScheduleDefault component="VirtualScheduleDefault" />
      </div>
      <StaffList />
    </div>
  )
}
