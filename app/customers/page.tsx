import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { CustomerList } from '@/components/customers/CustomerList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CustomersPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Customers" />
      <CustomerList />
    </div>
  )
}
