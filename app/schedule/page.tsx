import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { VirtualSchedule } from '@/components/VirtualSchedule'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'schedule', path: '/schedule' })
}

export default async function SchedulePage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Schedule" />
      <VirtualSchedule component="VirtualSchedule" />
    </div>
  )
}
