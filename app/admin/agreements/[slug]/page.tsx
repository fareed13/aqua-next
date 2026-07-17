import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { AgreementsAddEdit } from '@/components/admin/agreements/AgreementsAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AgreementEditPage({ params }: PageProps) {
  const { slug } = await params
  const agreementId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Agreements Add/Edit" />
      <AgreementsAddEdit agreementId={agreementId} />
    </div>
  )
}
