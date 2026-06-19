import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { AgreementList } from '@/components/agreements/AgreementList'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  const meta = await buildPageMetadata({ org, domain, pageName: 'agreements', path: '/agreements' })
  return { ...meta, robots: { index: false, follow: false } }
}

export default async function AgreementsPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Agreements" />
      <AgreementList />
    </div>
  )
}
