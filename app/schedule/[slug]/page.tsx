import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { ScheduleDetail } from '@/components/schedule/ScheduleDetail'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({
    org, domain, pageName: 'schedule-slug', pageSlug: slug, path: `/schedule/${slug}`,
  })
}

export default async function ScheduleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const parts = slug.split('-')
  const locationId = parts[parts.length - 1]
  const classId = parts[parts.length - 3]

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Schedule" />
      <ScheduleDetail classId={classId} locationId={locationId} />
    </div>
  )
}
