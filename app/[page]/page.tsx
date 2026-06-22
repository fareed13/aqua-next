import { fetchOrganization, fetchDynamicRoutes } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { DynamicPage } from '@/components/pages/DynamicPage'
import { ReviewsPageContent } from '@/components/reviews/ReviewsPageContent'
import { EventDefault } from '@/components/events/EventDefault'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Page } from '@/types/api'

export async function generateStaticParams() {
  const routes = await fetchDynamicRoutes()
  return routes
    .filter(r => /^\/[^/]+$/.test(r))
    .map(r => ({ page: r.split('/')[1] }))
}

interface PageProps {
  params: Promise<{ page: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page: slug } = await params
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({
    org,
    domain,
    pageName: slug,
    pageSlug: slug,
    path: `/${slug}`,
  })
}

export default async function CatchAllPage({ params }: PageProps) {
  const { page: slug } = await params
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const location = organization.locations[0]

  let foundPage: Page | undefined

  if (slug === 'events') {
    return (
      <div>
        <LandingPageBanner component="LandingPageBanner" headline="Events" />
        <EventDefault component="EventDefault" />
      </div>
    )
  }

  if (slug === 'contact') {
    foundPage = location.pages?.find(p => p.slug === 'contact')
  } else if (slug === 'reviews') {
    foundPage = location.pages?.find(p => p.slug === 'reviews')
  } else {
    const allPages = organization.locations.flatMap(l => l.pages ?? [])
    foundPage = allPages.find(p => p.slug === slug)
  }

  if (!foundPage && slug !== 'reviews') {
    notFound()
  }

  const headline = ['contact', 'reviews'].includes(slug)
    ? (organization.name ?? foundPage?.name ?? '')
    : foundPage!.name

  if (slug === 'reviews') {
    return (
      <div>
        <LandingPageBanner component="LandingPageBanner" headline={headline || organization.name || 'Reviews'} />
        {foundPage && foundPage.content?.length > 0
          ? <DynamicPage page={foundPage} headlineFromMeta={headline} />
          : <ReviewsPageContent />
        }
      </div>
    )
  }

  return (
    <div>
      {foundPage!.show_header && (
        <LandingPageBanner component="LandingPageBanner" headline={headline} />
      )}
      <DynamicPage page={foundPage!} headlineFromMeta={headline} />
    </div>
  )
}
