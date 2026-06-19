import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { DynamicPage } from '@/components/pages/DynamicPage'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Page } from '@/types/api'

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

  if (slug === 'contact') {
    foundPage = location.pages?.find(p => p.slug === 'contact')
  } else if (slug === 'reviews') {
    foundPage = location.pages?.find(p => p.slug === 'reviews')
  } else {
    const allPages = organization.locations.flatMap(l => l.pages ?? [])
    foundPage = allPages.find(p => p.slug === slug)
  }

  if (!foundPage) {
    notFound()
  }

  const headline = ['contact', 'reviews'].includes(slug)
    ? (organization.name ?? foundPage.name)
    : foundPage.name

  return (
    <div>
      {foundPage.show_header && (
        <LandingPageBanner component="LandingPageBanner" headline={headline} />
      )}
      <DynamicPage page={foundPage} headlineFromMeta={headline} />
    </div>
  )
}
