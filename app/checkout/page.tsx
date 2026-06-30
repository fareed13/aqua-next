import { Suspense } from 'react'
import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { CheckoutPageClient } from '@/components/checkout/CheckoutPageClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const domain = getDomain()
    const org = (await fetchOrganization(domain))[0]
    if (!org) return { title: 'Checkout' }
    return buildPageMetadata({ org, domain, pageName: 'checkout', path: '/checkout' })
  } catch {
    return { title: 'Checkout' }
  }
}

export default function CheckoutPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Checkout" />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded shadow">
          <Suspense>
            <CheckoutPageClient />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
