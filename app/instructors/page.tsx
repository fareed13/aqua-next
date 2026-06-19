import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { StaffList } from '@/components/instructor/StaffList'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'instructors', path: '/instructors' })
}

export default async function InstructorsPage() {
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]

  const headline = organization.instructor_h1_headline || 'Instructors'

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline={headline} />
      <StaffList />
    </div>
  )
}
