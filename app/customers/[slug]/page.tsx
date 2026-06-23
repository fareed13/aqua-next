import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { CustomerAddEdit } from '@/components/customers/CustomerAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function CustomerDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const query = await searchParams
  const spam = typeof query.spam === 'string' ? query.spam : null

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Customer Add/Edit" />
      <CustomerAddEdit contactId={slug} spam={spam} />
    </div>
  )
}
