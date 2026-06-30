import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
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
      <div className="max-w-4xl mx-auto px-4">
        <CheckoutForm />
      </div>
    </div>
  )
}
