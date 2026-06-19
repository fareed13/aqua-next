import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { RefundPolicy } from '@/components/policies/Refund'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'refund-policy', path: '/refund-policy' })
}

export default async function RefundPolicyPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Refund Policy" />
      <RefundPolicy />
    </div>
  )
}
