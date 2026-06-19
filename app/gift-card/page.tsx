import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { GiftCard } from '@/components/giftCards/GiftCard'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'gift-card', path: '/gift-card' })
}

export default async function GiftCardPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Gift Cards" />
      <GiftCard />
    </div>
  )
}
