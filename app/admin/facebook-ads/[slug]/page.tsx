import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { FacebookAddEdit } from '@/components/admin/facebookAds/FacebookAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function FacebookAdsEditPage({ params }: PageProps) {
  const { slug } = await params
  const adsId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Facebook Add/Edit" />
      <FacebookAddEdit adsId={adsId} />
    </div>
  )
}
