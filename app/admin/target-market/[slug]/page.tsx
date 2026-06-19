import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { TargetMarketAddEdit } from '@/components/admin/targetMarket/TargetMarketAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function TargetMarketEditPage({ params }: PageProps) {
  const { slug } = await params
  const audienceId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Target Market Add/Edit" />
      <TargetMarketAddEdit audienceId={audienceId} />
    </div>
  )
}
