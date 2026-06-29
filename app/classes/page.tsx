import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { ServiceClasses } from '@/components/classes/ServiceClasses'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'classes', path: '/classes' })
}

export default async function ClassesPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Classes" />
      <ServiceClasses />
    </div>
  )
}
