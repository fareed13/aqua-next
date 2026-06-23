import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { GoogleAdsAddEdit } from '@/components/admin/googleAds/GoogleAdsAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function GoogleAdsEditPage({ params }: PageProps) {
  const { slug } = await params
  const adsId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Google Ads" />
      <GoogleAdsAddEdit adsId={adsId} />
    </div>
  )
}
